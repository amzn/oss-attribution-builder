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

import auth from '../../auth';
import * as packagedb from '../../db/packages';
import * as db from '../../db/projects';
import { RequestError } from '../../errors';

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

    // check contacts
    await validateContacts(req.body.contacts);

    // TODO: validate ACL
  } catch (e) {
    return next(e);
  }
  return next();
}

export async function patchProject(req, res, next) {
  try {
    const valid = new Set(['title', 'version', 'description', 'plannedRelease', 'contacts',
    'acl', 'metadata']);
    for (const key of Object.keys(req.body)) {
      if (!valid.has(key)) {
        throw new RequestError(`'${key}' is not a valid field.`);
      }
    }

    if (req.body.hasOwnProperty('contacts')) {
      await validateContacts(req.body.contacts);
    }

    // TODO: validate ACL
  } catch (e) {
    return next(e);
  }
  return next();
}

async function validateContacts(contacts) {
  for (const contactType of Object.keys(contacts)) {
    for (const contact of contacts[contactType]) {
      const n = await auth.getDisplayName(contact);
      if (n == null) {
        throw new RequestError(`Contact ${contact} could not be found.`);
      }
    }
  }
}

export async function attachPackage(req, res, next) {
  try {
    const fields = {
      name: 'package name',
      version: 'package version',
      website: 'package website',
      copyright: 'package copyright',
      modified: 'modified option',
      link: 'linkage option',
    };
    ensureFieldsExist(fields, req.body);

    // website should look something like a url
    if (/^\w+:\/\/\w+/.test(req.body.website) === false) {
      throw new RequestError('Website is not a real URL.');
    }

    // coerce undefined/emptyish keys to null
    if (req.body.license == null || req.body.license.trim().length === 0) req.body.license = null;
    if (req.body.licenseText == null || req.body.licenseText.trim().length === 0) req.body.licenseText = null;

    // either the license name or the full license text must be specified
    if (!isValid(req.body, 'license') && !isValid(req.body, 'licenseText')) {
      throw new RequestError('Either the license name or full text must be provided.');
    }

    // ensure the project exists
    const project = rejectEmptyPromise(db.getProject(req.params.projectId), 'Project doesn\'t exist.');

    // and that, if specified, the package exists
    let pkg = Promise.resolve();
    if (req.body.packageId != null) {
      req.body.packageId = Number.parseInt(req.body.packageId);
      if (Number.isNaN(req.body.packageId)) {
        throw new RequestError('Package ID must be a number');
      }
      pkg = rejectEmptyPromise(packagedb.getPackage(req.body.packageId), 'Package doesn\'t exist.');
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
  return object.hasOwnProperty(field) && object[field] != null && object[field].length !== 0;
}

/**
 * Reject a promise if it resolves to null (or undefined).
 */
function rejectEmptyPromise(p, err) {
  return p.then((x) => {
    if (x == null) {
      return Promise.reject(new RequestError(err));
    }
    return Promise.resolve(x);
  });
}
