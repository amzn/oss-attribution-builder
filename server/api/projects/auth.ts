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
import { isAdmin, isUserInGroup } from '../../auth/util';
import { DbProject } from '../../db/projects';
import { AccessError } from '../../errors';
import { AccessLevel, AccessLevelStrength } from './interfaces';

/**
 * Check if the request's user is the project's contact list.
 */
export function isInContacts(req: any, project: Pick<DbProject, 'contacts'>) {
  const user = auth.extractRequestUser(req);
  for (const type of Object.keys(project.contacts)) {
    const contactList = project.contacts[type];
    if (contactList.includes(user)) {
      return true;
    }
  }
  return false;
}

export type ProjectAccess = Pick<DbProject, 'contacts' | 'acl'>;

/**
 * Throw an error if the request's user has no access.
 */
export async function assertProjectAccess(req: any, project: ProjectAccess, level: AccessLevel): Promise<void> {
  if (project != null) {
    const effective = await effectivePermission(req, project);
    if (effective != null) {
      if (AccessLevelStrength[effective] >= AccessLevelStrength[level]) {
        return;
      }
    }
  }

  throw new AccessError('This project does not exist or you do not have access to it.');
}

export async function effectivePermission(req: any, project: ProjectAccess): Promise<AccessLevel | null> {
  const user = auth.extractRequestUser(req);
  const reqGroups = await auth.getGroups(user);

  // start by checking the global list
  // TODO: make global list ACL-like too
  if (isAdmin(req, reqGroups)) {
    return 'owner';
  }

  // then check the project ACL
  let effective: AccessLevel | null = null;
  let effectiveStrength = 0;
  for (const entity of Object.keys(project.acl)) {
    // skip groups that aren't relevant for the requester
    if (!isUserInGroup(entity, reqGroups)) {
      continue;
    }

    // if we find a level with stronger access, use that
    const level = project.acl[entity];
    const strength = AccessLevelStrength[level];
    if (strength > effectiveStrength) {
      effective = level;
      effectiveStrength = strength;
    }
  }

  // then check the contact list (defaults to view permissions)
  if (effectiveStrength < AccessLevelStrength.viewer && isInContacts(req, project)) {
    effective = 'viewer';
  }

  return effective;
}
