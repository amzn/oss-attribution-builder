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
import { canHaveAdmin, isAdmin, isUserInGroup } from './util';

describe('auth util', function() {
  beforeAll(function() {
    config.admin = {
      groups: new Set(['admins']),
    };
  });

  it('should validate groups', function() {
    const req = {
      user: {
        groups: ['abc', 'xyz'],
      },
    };
    expect(isUserInGroup('xyz', req.user.groups)).toBe(true);
    expect(isUserInGroup('qwerty', req.user.groups)).toBe(false);
  });

  it('should validate user groups against configured admin set', function() {
    expect(canHaveAdmin(['employees', 'admins'])).toBe(true);
    expect(canHaveAdmin(['admins'])).toBe(true);
    expect(canHaveAdmin(['employees'])).toBe(false);
    expect(canHaveAdmin([])).toBe(false);
  });

  it('should only authorize admin actions when header is set', function() {
    const request = {
      get: h => undefined,
    } as any;
    expect(isAdmin(request, ['admins'])).toBe(false);
    request.get = h => {
      return h === 'X-Admin' ? '1' : undefined;
    };
    expect(isAdmin(request, ['admins'])).toBe(true);
    expect(isAdmin(request, ['blah'])).toBe(false);
  });
});
