// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Request } from 'express';

import { config } from '../config';

/**
 * Check if a request's user is in a given group.
 */
export function isUserInGroup(group: string, groups: string[]) {
  return groups.indexOf(group) !== -1;
}

/**
 * Check if a request's user is in any groups in the given set.
 * This is basically just set intersection.
 */
export function isUserInAnyGroup(supplied: string[], check: Set<string>) {
  for (const g of supplied) {
    if (check.has(g)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has administrative access to projects.
 */
export function isAdmin(req: Request, groups: string[]): boolean {
  return req.get('X-Admin') === '1' && canHaveAdmin(groups);
}

/**
 * Check if a user _could_ be an admin, if requested during auth.
 */
export function canHaveAdmin(groups: string[]) {
  return isUserInAnyGroup(groups, config.admin.groups);
}
