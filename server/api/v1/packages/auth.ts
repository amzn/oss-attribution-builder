// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as winston from 'winston';

import auth from '../../../auth';
import { isAdmin, isUserInAnyGroup } from '../../../auth/util';
import { config } from '../../../config';
import { AccessError } from '../../../errors';

export async function canValidate(req) {
  const user = auth.extractRequestUser(req);
  const groups = await auth.getGroups(user);

  if (isUserInAnyGroup(groups, config.admin.verifiers)) {
    return true;
  }

  if (isAdmin(req, groups)) {
    return true;
  }

  winston.warn('User %s cannot validate package metadata', user);
  return false;
}

export async function assertCanValidate(req) {
  if (!(await canValidate(req))) {
    throw new AccessError(
      'You do not have access to validate package metadata.'
    );
  }
}
