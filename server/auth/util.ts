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
