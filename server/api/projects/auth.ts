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

import * as winston from 'winston';
import { isAdmin, isUserInGroup } from '../../auth/util';
import { DbProject } from '../../db/projects';
import { AccessError } from '../../errors';

/**
 * Check if the request's user is the project's contact list.
 */
export function isInContacts(req: any, project: Pick<DbProject, 'contacts'>) {
  for (const type of Object.keys(project.contacts)) {
    const contactList = project.contacts[type];
    if (contactList.includes(req.user.user)) {
      return true;
    }
  }
  return false;
}

type DbProjectAccess = Pick<DbProject, 'contacts' | 'acl' | 'project_id'>;

/**
 * Check if a request's user has access to a project.
 */
export function hasProjectAccess(req: any, project: DbProjectAccess) {
  // TODO: this only pays attention to 'owner' at the moment.
  // this function should eventually be replaced by effectivePermission below.
  for (const entity of Object.keys(project.acl))
    if (project.acl[entity] === 'owner' && isUserInGroup(req, entity)) {
    return true;
  }

  // TODO: contacts should probably only have read access unless otherwise granted
  if (isInContacts(req, project)) {
    return true;
  }

  if (isAdmin(req)) {
    return true;
  }

  winston.warn('User %s has no access to project %s', req.user.user, project.project_id);
  return false;
}

/**
 * Throw an error if the request's user has no access.
 */
export function assertProjectAccess(req: any, project: DbProjectAccess) {
  if (project == null || !hasProjectAccess(req, project)) {
    throw new AccessError('This project does not exist or you do not have access to it.');
  }
  return true;
}

export function effectivePermission(project: DbProject) {
  // TODO: check global list
  // TODO: check project list
  // TODO: deprecate/replace hasProjectAccess
}
