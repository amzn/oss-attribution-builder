/* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { Request } from 'express';
import * as winston from 'winston';

import auth from '../../auth';
import { isAdmin } from '../../auth/util';
import * as documentdb from '../../db/attribution_documents';
import * as packagedb from '../../db/packages';
import * as db from '../../db/projects';
import { AccessError } from '../../errors/index';
import DocBuilder from '../../licenses/docbuilder';
import { storePackage } from '../packages';
import { assertProjectAccess, effectivePermission } from './auth';
import { AccessLevelStrength, WebProject } from './interfaces';

type ProjectIdPromise = Promise<Pick<WebProject, 'projectId'>>;

export async function getProject(req: Request, projectId: string): Promise<WebProject> {
  const project = await db.getProject(projectId);
  await assertProjectAccess(req, project, 'viewer');
  const accessLevel = await effectivePermission(req, project);

  // map DB types to a public API
  return {
    projectId,
    title: project.title,
    version: project.version,
    description: project.description,
    createdOn: project.created_on,
    plannedRelease: project.planned_release,
    contacts: project.contacts,
    acl: project.acl,
    packagesUsed: project.packages_used.map((usage) => {
      return {
        packageId: usage.package_id,
        modified: usage.modified,
        link: usage.link,
        notes: usage.notes,
      };
    }),
    metadata: project.metadata,
    access: {
      level: accessLevel,
      canEdit: AccessLevelStrength[accessLevel] >= AccessLevelStrength.editor,
    },
  };
}

export async function searchProjects(req: Request): Promise<Array<Partial<WebProject>>> {
  const groups = await auth.getGroups(req.user.user);

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

export async function createProject(req: Request, body: WebProject): ProjectIdPromise {
  const projectId = await db.createProject({
    title: body.title,
    version: body.version,
    description: body.description,
    planned_release: body.plannedRelease,
    contacts: body.contacts,
    acl: body.acl,
    metadata: body.metadata,
  }, req.user.user);

  winston.info('Project %s created by %s', projectId, req.user.user);
  return {projectId};
}

export async function patchProject(req: Request, projectId, changes): ProjectIdPromise {
  const project = await db.getProject(projectId);
  await assertProjectAccess(req, project, 'editor');

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
  for (const k of Object.keys(changes)) {
    // validate that requester is an owner for ACL changes
    if (k === 'acl') {
      await assertProjectAccess(req, project, 'owner');
    }
    mappedChanges[internalMap[k]] = changes[k];
  }

  await db.patchProject(projectId, mappedChanges, req.user.user);

  winston.info('Project %s modified by %s', projectId, req.user.user);
  return {projectId};
}

export async function attachPackage(req: Request, projectId, info) {
  const { packageId, name, version, website, copyright, modified, link, notes } = info;
  const { license, licenseText } = info;

  // access check
  const project = await db.getProject(projectId);
  await assertProjectAccess(req, project, 'editor');

  // see if we need to edit the existing package
  const newId = await storePackage(req, packageId, {
    name, version, website, copyright, license, licenseText,
  });

  // update usage info to store on project
  const usageInfo = {
    package_id: newId,
    modified,
    link,
    notes,
  };

  // when both are ready, update the project
  await db.updatePackagesUsed(projectId, [
    ...project.packages_used,
    usageInfo,
  ], req.user.user);

  // finally, return the updated/inserted package ID
  const addedPackageId = usageInfo.package_id;
  winston.info('Attached package %s to project %s', addedPackageId, projectId);
  return {packageId: addedPackageId};
}

export async function detachPackage(req: Request, projectId, packageId): ProjectIdPromise {
  const project = await db.getProject(projectId);
  await assertProjectAccess(req, project, 'editor');

  const newUsage = project.packages_used.filter((item) => {
    return item.package_id !== packageId;
  });

  await db.updatePackagesUsed(projectId, newUsage, req.user.user);
  winston.info('Detached package %s from project %s', packageId, projectId);
  return {projectId};
}

export async function replacePackage(req: Request, projectId: string, oldId: number, newId: number): ProjectIdPromise {
  const project = await db.getProject(projectId);
  await assertProjectAccess(req, project, 'editor');

  const usage = project.packages_used;
  for (const u of usage) {
    if (u.package_id === oldId) {
      u.package_id = newId;
    }
  }

  await db.updatePackagesUsed(projectId, usage, req.user.user);
  winston.info('Replaced package %s -> %s on project %s', oldId, newId, projectId);
  return {projectId};
}

export async function generateAttributionDocument(req: Request, projectId: string, store: boolean = false) {
  const project = await db.getProject(projectId);
  await assertProjectAccess(req, project, 'viewer');

  const packageIds = project.packages_used.map((usage) => usage.package_id);
  const packageList = await packagedb.getPackages(packageIds);

  // reorganize the package list from db into a map
  const packages: Map<number, packagedb.Package> = packageList.reduce((map, pkg) => {
    map.set(pkg.package_id, pkg);
    return map;
  }, new Map());

  // create attributions and add to generator
  const builder = new DocBuilder();
  for (const usage of project.packages_used) {
    const pkg = packages.get(usage.package_id);
    builder.addPackage(pkg, usage);
  }

  // do it!
  const text = builder.build();
  const warnings = builder.warnings;
  const annotations = builder.annotations;
  const summary = builder.summary;

  // save a copy if requested
  if (store) {
    const createdBy = req.user.user;
    documentdb.storeAttributionDocument(projectId, project.version, text, createdBy);
    winston.info(`Document for project ${projectId} was stored by ${createdBy}`);
    return {text};
  }

  return {text, annotations, warnings, summary};
}
