// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import config from '../config';
import AuthBase from './base';
import { canHaveAdmin } from './util';

// tslint:disable-next-line:no-var-requires
const impl = require(`./impl/${config.modules.auth}`).default;
const instance = new impl() as AuthBase;

export default instance;

export async function userInfo(req: any): Promise<any> {
  const username = instance.extractRequestUser(req);

  const displayName = await instance.getDisplayName(username);
  const groups = await instance.getGroups(username);
  const canAdmin = canHaveAdmin(groups);

  return {
    displayName,
    groups,
    permissions: {
      admin: canAdmin,
    },
    globalACL: config.globalACL,
  };
}
