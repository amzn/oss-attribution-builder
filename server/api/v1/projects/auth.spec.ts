// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as mockery from 'mockery';

import { AccessLevel } from './interfaces';

describe('projects auth', function() {
  let mock: any;
  let assertProjectAccess: any;
  let effectivePermission: any;

  function makeReq() {
    return {
      user: {
        user: 'someone',
      },
      get: () => undefined,
    } as any;
  }

  function makeProj() {
    return {
      project_id: 'foo',
      contacts: {
        legal: ['lawyer'],
      },
      acl: {
        wallet: 'owner' as AccessLevel,
      } as any,
    };
  }

  beforeEach(function() {
    mockery.enable({ useCleanCache: true, warnOnUnregistered: false });

    mock = {
      auth: {
        getGroups: jasmine
          .createSpy('getGroups')
          .and.returnValue(Promise.resolve(['a-nobody'])),
        extractRequestUser: req => req.user.user,
      },
      config: {
        admin: {
          groups: new Set(['admin-users']),
        },
        globalACL: {},
      },
    };

    mockery.registerMock('../../../auth', { default: mock.auth });
    mockery.registerMock('../../../config', { config: mock.config });
    mockery.registerMock('../config', { config: mock.config });

    mockery.registerAllowable('./auth');
    const auth = require('./auth');
    assertProjectAccess = auth.assertProjectAccess;
    effectivePermission = auth.effectivePermission;
  });

  afterEach(function() {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should allow owners to edit', async function(done) {
    const req = makeReq();
    const proj = makeProj();
    mock.auth.getGroups = jasmine
      .createSpy('getGroups')
      .and.returnValue(Promise.resolve(['wallet']));
    try {
      await assertProjectAccess(req, proj, 'owner');
    } catch (e) {
      fail(e);
    }
    done();
  });

  it('should allow legal contact to view', async function(done) {
    const req = makeReq();
    const proj = makeProj();
    req.user.user = 'lawyer';
    try {
      await assertProjectAccess(req, proj, 'viewer');
    } catch (e) {
      fail(e);
    }
    done();
  });

  it('should allow admins to edit', async function(done) {
    const req = makeReq();
    const proj = makeProj();

    // an admin account is not enough...
    mock.auth.getGroups = jasmine
      .createSpy('getGroups')
      .and.returnValue(Promise.resolve(['admin-users']));
    try {
      await assertProjectAccess(req, proj, 'owner');
    } catch (e) {
      expect(e.message).toMatch(/do not have access/);
    }

    // ...as you also need to set the header
    req.get = h => (h === 'X-Admin' ? '1' : undefined);
    try {
      await assertProjectAccess(req, proj, 'owner');
    } catch (e) {
      fail(e);
    }

    // ...as it checks the admin groups
    done();
  });

  it('should block anyone else', async function(done) {
    const req = makeReq();
    const proj = makeProj();

    try {
      await assertProjectAccess(req, proj, 'viewer');
      fail();
    } catch (err) {
      expect(err.message).toMatch(/do not have access/);
    }
    done();
  });

  describe('effectivePermission', function() {
    it('should return undefined for a single-entry ACL that does not match', async function(done) {
      const req = makeReq();
      const proj = makeProj();
      const level = await effectivePermission(req, proj);
      expect(level).toBeUndefined();
      done();
    });

    it('should return an access level for a single-entry ACL that does match', async function(done) {
      const req = makeReq();
      const proj = makeProj();
      mock.auth.getGroups = jasmine
        .createSpy('getGroups')
        .and.returnValue(Promise.resolve(['wallet']));
      const level = await effectivePermission(req, proj);
      expect(level).toEqual('owner');
      done();
    });

    it('should return a stronger level for multiple matching ACLs', async function(done) {
      const req = makeReq();
      const proj = makeProj();
      proj.acl.wallet = 'viewer';
      proj.acl.dog = 'editor';
      mock.auth.getGroups = jasmine
        .createSpy('getGroups')
        .and.returnValue(Promise.resolve(['wallet', 'dog']));
      const level = await effectivePermission(req, proj);
      expect(level).toEqual('editor');
      done();
    });

    it('should return a lower level when the higher does not match', async function(done) {
      const req = makeReq();
      const proj = makeProj();
      proj.acl.wallet = 'viewer';
      proj.acl.dog = 'editor';
      mock.auth.getGroups = jasmine
        .createSpy('getGroups')
        .and.returnValue(Promise.resolve(['wallet']));
      const level = await effectivePermission(req, proj);
      expect(level).toEqual('viewer');
      done();
    });
  });
});
