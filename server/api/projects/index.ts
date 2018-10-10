// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as express from 'express';
import * as winston from 'winston';

import auth from '../../auth';
import { isAdmin } from '../../auth/util';
import * as documentdb from '../../db/attribution_documents';
import * as packagedb from '../../db/packages';
import * as db from '../../db/projects';
import { DbPackageUsage } from '../../db/projects';
import { AccessError } from '../../errors/index';
import DocBuilder from '../../licenses/docbuilder';
import { storePackage } from '../packages';
import {
  assertProjectAccess,
  effectivePermission,
  requireProjectAccess,
} from './auth';
import { AccessLevel, AccessLevelStrength, WebProject } from './interfaces';
import { asyncApi } from '../../util/middleware';
import * as projectValidators from './validators';

export const router = express.Router();
export default router;

type ProjectIdPromise = Promise<Pick<WebProject, 'projectId'>>;

/**
 * List all projects filtered by access.
 */
router.get('/', asyncApi(searchProjects));
export async function searchProjects(req, res): Promise<Partial<WebProject>[]> {
  const user = auth.extractRequestUser(req);
  const groups = await auth.getGroups(user);

  // all projects
  if (req.query.all) {
    if (!isAdmin(req, groups)) {
      throw new AccessError('Cannot access all projects');
    }
    const projects = await db.searchProjects();
    return projects.map(mapProjectShortInfo);
  }

  // "my" projects
  const ownProjects = await db.searchOwnProjects(groups);
  return ownProjects.map(mapProjectShortInfo);
}

function mapProjectShortInfo(dbData): Partial<WebProject> {
  return {
    projectId: dbData.project_id,
    title: dbData.title,
    createdOn: dbData.created_on,
    version: dbData.version,
  };
}

/**
 * Create a new project.
 */
router.post('/new', projectValidators.createProject, asyncApi(createProject));
export async function createProject(req, res): ProjectIdPromise {
  const body: WebProject = req.body;
  const user = auth.extractRequestUser(req);
  const projectId = await db.createProject(
    {
      title: body.title,
      version: body.version,
      description: body.description,
      planned_release: body.plannedRelease,
      contacts: body.contacts,
      acl: body.acl,
      metadata: body.metadata,
      // do *not* accept raw user input for refs!
      // refs can implicitly grant access to other projects' contents.
      // allowing users to refer to other projects would be a security issue.
      refs: {},
    },
    user
  );

  winston.info('Project %s created by %s', projectId, user);
  return { projectId };
}

/**
 * Get a particular project.
 */
router.get('/:projectId', requireProjectAccess('viewer'), asyncApi(getProject));
export async function getProject(req, res): Promise<WebProject> {
  const project: db.DbProject = res.locals.project;
  const accessLevel = (await effectivePermission(req, project)) as AccessLevel;

  // map DB types to a public API
  return {
    projectId: project.project_id,
    title: project.title,
    version: project.version,
    description: project.description || '',
    createdOn: project.created_on,
    plannedRelease: project.planned_release,
    contacts: project.contacts,
    acl: project.acl,
    packagesUsed: project.packages_used.map(usage => ({
      ...usage,
      package_id: undefined,
      packageId: usage.package_id,
    })),
    refs: project.refs,
    metadata: project.metadata || {},
    access: {
      level: accessLevel,
      canEdit: AccessLevelStrength[accessLevel] >= AccessLevelStrength.editor,
    },
  };
}

/**
 * Edit a project's basic details.
 */
router.patch(
  '/:projectId',
  requireProjectAccess('editor'),
  projectValidators.patchProject,
  asyncApi(patchProject)
);

export async function patchProject(req, res): ProjectIdPromise {
  const {
    params: { projectId },
    body,
  } = req;
  const user = auth.extractRequestUser(req);
  const project: db.DbProject = res.locals.project;

  // map API names to DB columns
  const internalMap = {
    title: 'title',
    version: 'version',
    description: 'description',
    plannedRelease: 'planned_release',
    contacts: 'contacts',
    acl: 'acl',
    metadata: 'metadata',
  };
  const mappedChanges = {};
  for (const k of Object.keys(body)) {
    // validate that requester is an owner for ACL changes
    if (k === 'acl') {
      await assertProjectAccess(req, project, 'owner');
    }
    mappedChanges[internalMap[k]] = body[k];
  }

  await db.patchProject(projectId, mappedChanges, user);

  winston.info('Project %s modified by %s', projectId, user);
  return { projectId };
}

/**
 * Attach a package to a project, optionally creating or updating the package.
 */
router.post(
  '/:projectId/attach',
  requireProjectAccess('editor'),
  projectValidators.attachPackage,
  asyncApi(attachPackage)
);
export async function attachPackage(req, res): Promise<{ packageId: number }> {
  const {
    params: { projectId },
    body: {
      packageId,
      name,
      version,
      website,
      copyright,
      usage,
      license,
      licenseText,
    },
  } = req;

  // access check
  const user = auth.extractRequestUser(req);
  const project: db.DbProject = res.locals.project;

  // see if we need to edit the existing package
  const newId = await storePackage(req, packageId, {
    name,
    version,
    website,
    copyright,
    license,
    licenseText,
  });

  // update usage info to store on project
  const usageInfo: DbPackageUsage = {
    ...usage,
    package_id: newId,
  };

  // filter out any existing packages with the current/previous ID.
  // no sense in having more than one instance, so assume that
  // re-submitting means "edit". note that if the package details
  // were changed (instead of just usage info) then a new package
  // ID will have been created, and the old one won't get removed.
  const used = project.packages_used.filter(u => u.package_id !== packageId); // *not* newId
  used.push(usageInfo);

  // submit the update
  await db.updatePackagesUsed(projectId, used, user);

  // finally, return the updated/inserted package ID
  const addedPackageId = usageInfo.package_id;
  winston.info('Attached package %s to project %s', addedPackageId, projectId);
  return { packageId: addedPackageId };
}

/**
 * Detach a package from a project.
 */
router.post(
  '/:projectId/detach',
  requireProjectAccess('editor'),
  asyncApi(detachPackage)
);

export async function detachPackage(req, res): ProjectIdPromise {
  const {
    params: { projectId },
    body: { packageId },
  } = req;
  const user = auth.extractRequestUser(req);
  const project: db.DbProject = res.locals.project;

  const newUsage = project.packages_used.filter(item => {
    return item.package_id !== packageId;
  });

  await db.updatePackagesUsed(projectId, newUsage, user);
  winston.info('Detached package %s from project %s', packageId, projectId);
  return { projectId };
}

/**
 * Replace a package instance with another, without changing the usage.
 */
router.post(
  '/:projectId/replace',
  requireProjectAccess('editor'),
  projectValidators.replacePackage,
  asyncApi(replacePackage)
);
export async function replacePackage(req, res): ProjectIdPromise {
  const {
    params: { projectId },
    body: { oldId, newId },
  } = req;

  const user = auth.extractRequestUser(req);
  const project: db.DbProject = res.locals.project;

  const usage = project.packages_used;
  for (const u of usage) {
    if (u.package_id === oldId) {
      u.package_id = newId;
    }
  }

  await db.updatePackagesUsed(projectId, usage, user);
  winston.info(
    'Replaced package %s -> %s on project %s',
    oldId,
    newId,
    projectId
  );
  return { projectId };
}

/**
 * Preview an attribution document. Return the document along
 * with any warnings.
 */
router.get(
  '/:projectId/build',
  requireProjectAccess('viewer'),
  asyncApi(async (req, res) => generateAttributionDocument(req, res, false))
);

/**
 * Building a document using POST will trigger a store & download.
 */
router.post(
  '/:projectId/build',
  requireProjectAccess('viewer'),
  asyncApi(async (req, res) => generateAttributionDocument(req, res, true))
);

export async function generateAttributionDocument(req, res, store = false) {
  const {
    params: { projectId },
  } = req;

  const user = auth.extractRequestUser(req);
  const project: db.DbProject = res.locals.project;

  const packageIds = project.packages_used.map(usage => usage.package_id);
  const packageList = await packagedb.getPackages(packageIds);

  // reorganize the package list from db into a map
  const packages: Map<number, packagedb.Package> = packageList.reduce(
    (map, pkg) => {
      map.set(pkg.package_id, pkg);
      return map;
    },
    new Map()
  );

  // create attributions and add to generator
  const builder = new DocBuilder();
  for (const usage of project.packages_used) {
    const pkg = packages.get(usage.package_id);
    if (pkg == undefined) {
      throw new Error(`Reference to package ${usage.package_id} was not found`);
    }
    builder.addPackage(pkg, usage);
  }

  // do it!
  const text = builder.build();
  const warnings = builder.warnings;
  const annotations = builder.annotations;
  const summary = builder.summary;

  // save a copy if requested
  if (store) {
    await documentdb.storeAttributionDocument(
      projectId,
      project.version,
      text,
      user
    );
    winston.info(`Document for project ${projectId} was stored by ${user}`);
    return { text };
  }

  return { text, annotations, warnings, summary };
}

/**
 * Clone a project.
 */
router.post(
  '/:projectId/clone',
  requireProjectAccess('viewer'),
  projectValidators.cloneProject,
  asyncApi(cloneProject)
);
export async function cloneProject(req, res): ProjectIdPromise {
  const originalProjectId = req.params.projectId;

  const user = auth.extractRequestUser(req);
  const originalProject: db.DbProject = res.locals.project;

  const body = req.body;
  const projectId = await db.createProject(
    {
      title: body.title,
      version: body.version,
      description: originalProject.description,
      planned_release: originalProject.planned_release,
      contacts: originalProject.contacts,
      acl: body.acl,
      refs: {
        [originalProjectId]: { type: 'cloned_from' },
      },
      metadata: originalProject.metadata,
    },
    user
  );

  winston.info(
    'Project %s cloned from %s by %s',
    projectId,
    originalProjectId,
    user
  );
  return { projectId };
}
