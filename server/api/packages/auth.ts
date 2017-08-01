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

import { isAdmin, isUserInAnyGroup } from '../../auth/util';
import { config } from '../../config';
import { AccessError } from '../../errors';

export function canValidate(req) {
  if (isUserInAnyGroup(req, config.admin.verifiers)) {
    return true;
  }

  if (isAdmin(req)) {
    return true;
  }

  winston.warn('User %s cannot validate package metadata', req.user.user);
  return false;
}

export function assertCanValidate(req) {
  if (!canValidate(req)) {
    throw new AccessError('You do not have access to validate package metadata.');
  }
}
