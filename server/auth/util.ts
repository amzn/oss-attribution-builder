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

import * as expressJwt from 'express-jwt';
import * as jwt from 'jsonwebtoken';
import * as winston from 'winston';
import { config } from '../config';

// snag the key from the configuration, *moving* the value here
let jwtSecret = '';
export function loadJWTSecret() {
  jwtSecret = config.jwt.secret();
}

/**
 * A JWT middleware suitable for protecting application views.
 *
 * Lazy-loaded from configuration; config may not be ready by
 * the time this has been initialized.
 */
export const jwtMiddleware = expressJwt({
  secret: (req: any, payload: any, done: any) => {
    done(null, jwtSecret);
  },
});

/**
 * Given a set of claims, issue a token usable for authentication.
 */
export function issueToken(claims: any) {
  return jwt.sign(claims, jwtSecret, {
    algorithm: 'HS256',
    issuer: config.jwt.issuer,
    expiresIn: config.jwt.expiration,
  });
}

/**
 * If admin access is requested, validate permissions and attach a claim.
 *
 * If it's not being requested but the user *can* have admin access,
 * advertise that fact with a false flag.
 */
export function attachAdminClaim(req: any, claims: any) {
  if (canHaveAdmin(claims)) {
    if (req.query.admin === 'true') {
      // add admin access if requested
      claims.admin = true;
      winston.info('Admin access granted for %s', claims.user, {claims});
    } else {
      // advertise the capability otherwise (to show UI toggle)
      claims.admin = false;
    }
  }
}

/**
 * Check if a request's user is in a given group.
 */
export function isUserInGroup(req: any, group: string) {
  return req.user.groups.indexOf(group) !== -1;
}

/**
 * Check if a request's user is in any groups in the given set.
 */
export function isUserInAnyGroup(req: any, groups: Set<string>) {
  for (const g of req.user.groups) {
    if (groups.has(g)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has administrative access to projects.
 */
export function isAdmin(req: any) {
  return req.user.admin === true && canHaveAdmin(req.user);
}

/**
 * Check if a user _could_ be an admin, if requested during auth.
 */
export function canHaveAdmin(user: any) {
  for (const g of user.groups) {
    if (config.admin.groups.has(g)) {
      return true;
    }
  }
  return false;
}
