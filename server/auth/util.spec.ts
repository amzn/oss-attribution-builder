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
import { attachAdminClaim, canHaveAdmin, isAdmin, isUserInGroup } from './util';

describe('auth util', function () {

  beforeAll(function () {
    config.admin = {
      groups: new Set(['admins']),
    };
  });

  it('should validate groups', function () {
    const req = {
      user: {
        groups: ['abc', 'xyz'],
      },
    };
    expect(isUserInGroup(req, 'xyz')).toBe(true);
    expect(isUserInGroup(req, 'qwerty')).toBe(false);
  });

  it('should validate user groups against configured admin set', function () {
    expect(canHaveAdmin({groups: ['employees', 'admins']})).toBe(true);
    expect(canHaveAdmin({groups: ['admins']})).toBe(true);
    expect(canHaveAdmin({groups: ['employees']})).toBe(false);
    expect(canHaveAdmin({groups: []})).toBe(false);
  });

  it('should grant admin only if requested via token', function () {
    const req = {
      user: {
        groups: ['admins'],
        admin: false,
      },
    };
    expect(isAdmin(req)).toBe(false);
    req.user.admin = true;
    expect(isAdmin(req)).toEqual(true);
  });

  it('should attach an admin claim', function () {
    const req = {
      query: {
        admin: undefined,
      },
    } as any;
    const claims = {
      user: 'bob',
      groups: ['nobody'],
      admin: undefined,
    } as any;

    attachAdminClaim(req, claims);
    expect(claims.admin).toBe(undefined);

    claims.groups = ['admins'];
    attachAdminClaim(req, claims);
    expect(claims.admin).toBe(false);

    req.query.admin = 'true';
    attachAdminClaim(req, claims);
    expect(claims.admin).toBe(true);
  });

});
