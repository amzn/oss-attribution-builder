// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
