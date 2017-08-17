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
  };
}
