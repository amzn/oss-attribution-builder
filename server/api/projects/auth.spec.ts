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
import { assertProjectAccess, effectivePermission } from './auth';
import { AccessLevel } from './interfaces';

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
        wallet: 'owner' as AccessLevel,
      } as any,
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
    expect(() => assertProjectAccess(req, proj, 'owner')).not.toThrow();
  });

  it('should allow legal contact to view', function () {
    const req = makeReq();
    const proj = makeProj();
    req.user.user = 'lawyer';
    expect(() => assertProjectAccess(req, proj, 'viewer')).not.toThrow();
  });

  it('should allow admins to edit', function () {
    const req = makeReq();
    const proj = makeProj();

    // just admin flag is not enough...
    req.user.admin = true;
    expect(() => assertProjectAccess(req, proj, 'owner')).toThrowError(/do not have access/);

    // ...as it double-checks the admin groups
    req.user.groups.push('admin-users');
    expect(() => assertProjectAccess(req, proj, 'owner')).not.toThrow();
  });

  it('should block anyone else', function () {
    const req = makeReq();
    const proj = makeProj();
    const func = assertProjectAccess.bind(null, req, proj);
    expect(func).toThrowError(/do not have access/);
  });

  describe('effectivePermission', function () {

    it('should return null for a single-entry ACL that does not match', function () {
      const req = makeReq();
      const proj = makeProj();
      const level = effectivePermission(req, proj);
      expect(level).toBeNull();
    });

    it('should return an access level for a single-entry ACL that does match', function () {
      const req = makeReq();
      const proj = makeProj();
      req.user.groups.push('wallet');
      const level = effectivePermission(req, proj);
      expect(level).toEqual('owner');
    });

    it('should return a stronger level for multiple matching ACLs', function () {
      const req = makeReq();
      const proj = makeProj();
      proj.acl.wallet = 'viewer';
      proj.acl.dog = 'editor';
      req.user.groups.push('wallet');
      req.user.groups.push('dog');
      const level = effectivePermission(req, proj);
      expect(level).toEqual('editor');
    });

    it('should return a lower level when the higher does not match', function () {
      const req = makeReq();
      const proj = makeProj();
      proj.acl.wallet = 'viewer';
      proj.acl.dog = 'editor';
      req.user.groups.push('wallet');
      const level = effectivePermission(req, proj);
      expect(level).toEqual('viewer');
    });

  });

});
