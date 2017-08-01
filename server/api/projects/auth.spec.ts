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

import config from '../../config';
import { assertProjectAccess } from './auth';

describe('projects auth', function () {

  function makeReq() {
    return {
      user: {
        user: 'someone',
        groups: ['one', 'two'],
        admin: undefined,
      },
    } as any;
  }

  function makeProj() {
    return {
      project_id: 'foo',
      contacts: {
        legal: [
          'lawyer',
        ],
      },
      acl: {
        wallet: 'owner',
      },
    };
  }

  beforeAll(function () {
    config.admin = {
      groups: new Set(['admin-users']),
    };
  });

  it('should allow owners to edit', function () {
    const req = makeReq();
    const proj = makeProj();
    req.user.groups.push('wallet');
    const result = assertProjectAccess(req, proj);
    expect(result).toBe(true);
  });

  it('should allow legal contact to edit', function () {
    const req = makeReq();
    const proj = makeProj();
    req.user.user = 'lawyer';
    const result = assertProjectAccess(req, proj);
    expect(result).toBe(true);
  });

  it('should allow admins to edit', function () {
    const req = makeReq();
    const proj = makeProj();

    // just admin flag is not enough...
    req.user.admin = true;
    const func = assertProjectAccess.bind(null, req, proj);
    expect(func).toThrowError(/do not have access/);

    // ...as it double-checks the admin groups
    req.user.groups.push('admin-users');
    const result2 = assertProjectAccess(req, proj);
    expect(result2).toBe(true);
  });

  it('should block anyone else', function () {
    const req = makeReq();
    const proj = makeProj();
    const func = assertProjectAccess.bind(null, req, proj);
    expect(func).toThrowError(/do not have access/);
  });

});
