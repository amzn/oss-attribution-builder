// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import auth from '../../../auth';
import * as packagedb from '../../../db/packages';
import * as db from '../../../db/projects';
import { RequestError } from '../../../errors';
import { licenses, mapTag } from '../../../licenses/index';
import { TagQuestions } from '../../../licenses/interfaces';
import { effectivePermission, ProjectAccess } from './auth';

export async function createProject(req, res, next) {
  try {
    const fields = {
      title: 'project name',
      version: 'project version',
      description: 'project description',
      plannedRelease: 'planned release date',
      contacts: 'legal contact',
      acl: 'project owner group',
      metadata: 'open sourcing option',
    };
    ensureFieldsExist(fields, req.body);

    // check contacts & ACLs for sanity
    await validateContacts(req.body.contacts);
    await validateAcl(req, { acl: req.body.acl, contacts: req.body.contacts });
  } catch (e) {
    return next(e);
  }
  return next();
}

export async function patchProject(req, res, next) {
  try {
    const valid = new Set([
      'title',
      'version',
      'description',
      'plannedRelease',
      'contacts',
      'acl',
      'metadata',
      // do *not* allow direct modification of 'refs'!
    ]);
    for (const key of Object.keys(req.body)) {
      if (!valid.has(key)) {
        throw new RequestError(`'${key}' is not a valid field.`);
      }
    }

    if (req.body.hasOwnProperty('contacts')) {
      await validateContacts(req.body.contacts);
    }

    if (req.body.hasOwnProperty('acl')) {
      // contact list doesn't matter for the sake of validating an updated ACL,
      // since we only care about losing owner permissions. contacts only have viewer.
      await validateAcl(req, { acl: req.body.acl, contacts: {} });
    }
  } catch (e) {
    return next(e);
  }
  return next();
}

async function validateContacts(contacts) {
  if (contacts.legal == undefined) {
    throw new RequestError('Missing legal contact');
  }
  for (const contactType of Object.keys(contacts)) {
    for (const contact of contacts[contactType]) {
      const n = await auth.getDisplayName(contact);
      if (n == undefined) {
        throw new RequestError(`Contact ${contact} could not be found.`);
      }
    }
  }
}

async function validateAcl(req: any, project: ProjectAccess) {
  const effective = await effectivePermission(req, project);
  if (effective !== 'owner') {
    throw new RequestError('You cannot remove yourself as an owner.');
  }
}

export async function attachPackage(req, res, next) {
  try {
    const fields = {
      name: 'package name',
      version: 'package version',
      website: 'package website',
      copyright: 'package copyright',
    };
    ensureFieldsExist(fields, req.body);

    // website should look something like a url
    if (/^\w+:\/\/\w+/.test(req.body.website) === false) {
      throw new RequestError('Website is not a real URL.');
    }

    // coerce undefined/emptyish keys to undefined
    if (req.body.license == undefined || req.body.license.trim().length === 0) {
      req.body.license = undefined;
    }
    if (
      req.body.licenseText == undefined ||
      req.body.licenseText.trim().length === 0
    ) {
      req.body.licenseText = undefined;
    }

    // either the license name or the full license text must be specified
    if (!isValid(req.body, 'license') && !isValid(req.body, 'licenseText')) {
      throw new RequestError(
        'Either the license name or full text must be provided.'
      );
    }

    // check for a usage block
    if (!isValid(req.body, 'usage')) {
      throw new RequestError('Missing usage information.');
    }

    // ensure that all required questions (via tags) were answered
    const license = licenses.get(req.body.license);
    const tags = license ? license.get('tags').toArray() : ['unknown'];
    const questions: TagQuestions = tags
      .map(name => mapTag(name).questions || {})
      .reduce(
        (acc, curr) => ({
          ...acc,
          ...curr,
        }),
        {} as TagQuestions
      );
    for (const key of Object.keys(questions)) {
      const q = questions[key];
      // validate it is present if required
      if (q.required) {
        if (!isValid(req.body.usage, key)) {
          throw new RequestError(`Usage question "${q.label}" is required.`);
        }
      }
      // validate it's a valid option if supplied
      const answer = req.body.usage[key];
      if (answer && q.options) {
        const accepted = q.options.map(o => o[0]);
        if (!accepted.includes(answer)) {
          throw new RequestError(
            `Answer to question "${q.label}" is not valid`
          );
        }
      }
    }

    // ensure the project exists
    const project = rejectEmptyPromise(
      db.getProject(req.params.projectId),
      "Project doesn't exist."
    );

    // and that, if specified, the package exists
    let pkg = Promise.resolve();
    if (req.body.packageId != undefined) {
      req.body.packageId = Number.parseInt(req.body.packageId);
      if (Number.isNaN(req.body.packageId)) {
        throw new RequestError('Package ID must be a number');
      }
      pkg = rejectEmptyPromise(
        packagedb.getPackage(req.body.packageId),
        "Package doesn't exist."
      );
    }

    await Promise.all([project, pkg]);
  } catch (e) {
    return next(e);
  }
  return next();
}

export async function replacePackage(req, res, next) {
  try {
    const fields = {
      oldId: 'old package ID',
      newId: 'new package ID',
    };
    ensureFieldsExist(fields, req.body);

    req.body.oldId = Number.parseInt(req.body.oldId);
    req.body.newId = Number.parseInt(req.body.newId);

    if (Number.isNaN(req.body.oldId) || Number.isNaN(req.body.newId)) {
      throw new RequestError('Package IDs must be numbers');
    }
  } catch (e) {
    return next(e);
  }
  return next();
}

export async function cloneProject(req, res, next) {
  try {
    const fields = {
      title: 'project name',
      version: 'project version',
      acl: 'project access list',
    };
    ensureFieldsExist(fields, req.body);

    // check ACL for sanity
    await validateAcl(req, { acl: req.body.acl, contacts: {} });
  } catch (e) {
    return next(e);
  }
  return next();
}

export async function createRef(req, res, next) {
  try {
    // ensure type is correct
    const type: db.DbProjectRef['type'] = req.body.type;
    if (type !== 'includes' && type !== 'related') {
      throw new RequestError('Invalid ref type.');
    }

    // no linking to ourselves
    if (req.params.projectId === req.body.targetProjectId) {
      throw new RequestError("You can't link a project to itself.");
    }
  } catch (e) {
    return next(e);
  }
  return next();
}

/**
 * Blow up with a nice error if any fields are missing from the request.
 */
function ensureFieldsExist(fields, object) {
  for (const field of Object.keys(fields)) {
    // all fields are required
    if (!isValid(object, field)) {
      throw new RequestError(`Missing ${fields[field]}.`);
    }
  }
}

/**
 * Determine whether a field is "valid" (non-zero) on an object.
 */
function isValid(object, field) {
  return (
    object.hasOwnProperty(field) &&
    object[field] != undefined &&
    object[field].length !== 0
  );
}

/**
 * Reject a promise if it resolves to null (or undefined).
 */
function rejectEmptyPromise(p, err) {
  return p.then(x => {
    if (x == undefined) {
      return Promise.reject(new RequestError(err));
    }
    return Promise.resolve(x);
  });
}
