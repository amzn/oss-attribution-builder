// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import auth from '../../auth';
import { isAdmin, isUserInGroup } from '../../auth/util';
import config from '../../config';
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
export async function assertProjectAccess(
  req: any,
  project: ProjectAccess,
  level: AccessLevel
): Promise<void> {
  if (project != undefined) {
    const effective = await effectivePermission(req, project);
    if (effective != undefined) {
      if (AccessLevelStrength[effective] >= AccessLevelStrength[level]) {
        return;
      }
    }
  }

  throw new AccessError(
    'This project does not exist or you do not have access to it.'
  );
}

export async function effectivePermission(
  req: any,
  project: ProjectAccess
): Promise<AccessLevel | undefined> {
  const user = auth.extractRequestUser(req);
  const reqGroups = await auth.getGroups(user);

  // start by checking the admin list
  // (this can be replaced with the global ACL at some point)
  if (isAdmin(req, reqGroups)) {
    return 'owner';
  }

  // check the global ACL
  const globalLevel = getAclLevel(config.globalACL, reqGroups);
  const globalStrength = globalLevel ? AccessLevelStrength[globalLevel] : 0;

  // then check the project ACL
  const projectLevel = getAclLevel(project.acl, reqGroups);
  const projectStrength = projectLevel ? AccessLevelStrength[projectLevel] : 0;

  // pick the higher of the two
  const [effective, effectiveStrength] =
    projectStrength > globalStrength
      ? [projectLevel, projectStrength]
      : [globalLevel, globalStrength];

  // then check the contact list (defaults to view permissions)
  if (
    effectiveStrength < AccessLevelStrength.viewer &&
    isInContacts(req, project)
  ) {
    return 'viewer';
  }

  return effective;
}

/**
 * Given an ACL and a user's groups, return their access level.
 */
function getAclLevel(
  acl: DbProject['acl'],
  groups: string[]
): AccessLevel | undefined {
  let effective: AccessLevel | undefined;
  let effectiveStrength = 0;
  for (const entity of Object.keys(acl)) {
    // skip groups that aren't relevant for the requester
    if (!isUserInGroup(entity, groups)) {
      continue;
    }

    // if we find a level with stronger access, use that
    const level = acl[entity];
    const strength = AccessLevelStrength[level];
    if (strength > effectiveStrength) {
      effective = level;
      effectiveStrength = strength;
    }
  }

  return effective;
}
