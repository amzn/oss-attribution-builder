// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as mockery from 'mockery';

describe('projects', function() {
  let api: any;
  let validators: any;
  let mock: any;

  beforeEach(function() {
    mockery.enable({ useCleanCache: true, warnOnUnregistered: false });
    mock = {
      db: {},
      auth: {
        extractRequestUser: req => req.user.user,
      },
      packagedb: {},
      assertProjectAccess: jasmine.createSpy('assertProjectAccess'),
      requireProjectAccess: jasmine
        .createSpy('requireProjectAccess')
        .and.returnValue((req, res, next) => next()),
      effectivePermission: jasmine.createSpy('effectivePermission'),
    };

    // project module mocks
    mockery.registerMock('../../auth', { default: mock.auth });
    mockery.registerMock('../../db/projects', mock.db);
    mockery.registerMock('../../db/packages', mock.packagedb);
    mockery.registerMock('./auth', {
      assertProjectAccess: mock.assertProjectAccess,
      requireProjectAccess: mock.requireProjectAccess,
      effectivePermission: mock.effectivePermission,
    });

    // re-silence winston (since this is a clean cache)
    const winston = require('winston');
    winston.remove(winston.transports.Console);

    // load up the modules and go
    mockery.registerAllowable('./index');
    mockery.registerAllowable('./validators');
    api = require('./index');
    validators = require('./validators');
  });

  afterEach(function() {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('createProject', function() {
    it('should insert a valid project', async function() {
      mock.db.createProject = jasmine
        .createSpy('createProject')
        .and.returnValue(1234);
      mock.auth.getDisplayName = jasmine
        .createSpy('getDisplayName')
        .and.callFake(
          u => u === 'pretend-user' && Promise.resolve('Pretender')
        );

      const req = makeDummyRequest();
      const res = jasmine.createSpy('res');
      const next = jasmine.createSpy('next');

      validators.createProject(req, res, next);

      const p = await api.createProject(req, res);
      expect(p.projectId).toEqual(1234);
    });

    it('should reject invalid form data', async function() {
      const req = makeDummyRequest();
      req.body.description = undefined;
      const res = jasmine.createSpy('res');
      const next = jasmine.createSpy('next');

      await validators.createProject(req, res, next);
      expect(next.calls.first().args[0].message).toMatch(
        /Missing.*description/
      );
    });

    it('should validate user existence', async function() {
      mock.auth.getDisplayName = jasmine
        .createSpy('getDisplayName')
        .and.returnValue(Promise.resolve(undefined));

      const req = makeDummyRequest();
      const res = jasmine.createSpy('res');
      const next = jasmine.createSpy('next');

      await validators.createProject(req, res, next);
      expect(next.calls.first().args[0].name).toEqual('RequestError');
      expect(next.calls.first().args[0].message).toContain('Contact');
    });

    function makeDummyRequest() {
      return {
        user: {
          user: 'me',
          groups: ['abc'],
        },
        body: {
          title: 'title',
          version: '9001',
          description: 'description',
          plannedRelease: '2000-01-01 01:01:01',
          contacts: {
            legal: ['pretend-user'],
          },
          acl: { abc: 'owner' },
          metadata: { open_sourcing: true },
        },
      } as any;
    }
  });

  describe('patchProject', function() {
    it('should change the project', async function() {
      mock.db.getProject = jasmine
        .createSpy('getProject')
        .and.returnValue(makeFakeDBProject());
      mock.db.patchProject = jasmine
        .createSpy('getProject')
        .and.returnValue(Promise.resolve());

      const req = makeDummyRequest();
      const res = makeDummyResponse({project_id: 'abcd'});
      const next = jasmine.createSpy('next');
      req.body.contacts.someone = 'legal';

      await validators.patchProject(req, res, next);

      const p = await api.patchProject(req, res);
      expect(mock.db.patchProject).toHaveBeenCalled();
      const [projectId, changes] = mock.db.patchProject.calls.first().args;
      expect(p.projectId).toEqual('abcd');
      expect(projectId).toEqual('abcd');
      expect(changes.contacts.someone).toEqual('legal');
    });

    it('should validate patched fields', async function() {
      const req = makeDummyRequest();
      const res = makeDummyResponse({project_id: 'abcd'});
      const next = jasmine.createSpy('next');
      req.body.notAField = 'wat';

      await validators.patchProject(req, res, next);
      expect(next.calls.first().args[0].message).toContain('not a valid field');
    });

    function makeDummyRequest() {
      return {
        params: {
          projectId: 'abcd',
        },
        user: {
          user: 'fake person',
          groups: [],
        },
        body: {
          contacts: {},
          notAField: undefined,
        },
      } as any;
    }
  });

  describe('attachPackage', function() {
    it('should attach an existing package', async function() {
      mock.packagedb.getPackage = jasmine
        .createSpy('getPackage')
        .and.callFake(x => x === 90 && Promise.resolve(makeFakeDBPackage()));
      mock.db.updatePackagesUsed = jasmine.createSpy('updatePackagesUsed');

      const req = makeDummyRequest();
      const res = makeDummyResponse(makeFakeDBProject());
      const next = jasmine.createSpy('next');

      await validators.attachPackage(req, res, next);

      const p = await api.attachPackage(req, res);
      expect(p.packageId).toEqual(90);
      expect(mock.db.updatePackagesUsed).toHaveBeenCalled();
      const [projectId, usages] = mock.db.updatePackagesUsed.calls.first().args;
      expect(projectId).toEqual('abcd');
      expect(usages[usages.length - 1].package_id).toEqual(90);
    });

    it('should create a new package if it did not exist', async function() {
      // the only difference in this test is we're mocking a different method.
      // then we pretend it was a new package. ;D
      // anything that's not mocked will blow up in the actual code (cannot call undefined)
      mock.packagedb.createPackageRevision = jasmine
        .createSpy('createPackageRevision')
        .and.returnValue(Promise.resolve(90));
      mock.db.updatePackagesUsed = jasmine.createSpy('updatePackagesUsed');

      const req = makeDummyRequest();
      req.body.packageId = undefined;
      const res = makeDummyResponse(makeFakeDBProject());
      const next = jasmine.createSpy('next');

      await validators.attachPackage(req, res, next);

      const p = await api.attachPackage(req, res);
      expect(p.packageId).toEqual(90);
      expect(mock.packagedb.createPackageRevision).toHaveBeenCalled();
      expect(mock.db.updatePackagesUsed).toHaveBeenCalled();
      const [projectId, usages] = mock.db.updatePackagesUsed.calls.first().args;
      expect(projectId).toEqual('abcd');
      expect(usages[usages.length - 1].package_id).toEqual(90);
    });

    it('should create a new package revision for field updates', async function() {
      // similar to the above tests, but return a new package because a field changed.
      // in this case, the version was modified.
      mock.packagedb.getPackage = jasmine
        .createSpy('getPackage')
        .and.callFake(x => x === 90 && Promise.resolve(makeFakeDBPackage()));
      mock.packagedb.createPackageRevision = jasmine
        .createSpy('createPackageRevision')
        .and.returnValue(Promise.resolve(90));
      mock.packagedb.createPackageRevision = jasmine
        .createSpy('createPackageRevision')
        .and.returnValue(Promise.resolve(91));
      mock.db.updatePackagesUsed = jasmine.createSpy('updatePackagesUsed');

      const req = makeDummyRequest();
      req.body.version = '2.0.1';
      const res = makeDummyResponse(makeFakeDBProject());
      const next = jasmine.createSpy('next');

      await validators.attachPackage(req, res, next);

      const p = await api.attachPackage(req, res);
      expect(p.packageId).toEqual(91);
      expect(mock.packagedb.createPackageRevision).toHaveBeenCalled();
      expect(mock.db.updatePackagesUsed).toHaveBeenCalled();
      const [projectId, usages] = mock.db.updatePackagesUsed.calls.first().args;
      expect(projectId).toEqual('abcd');
      expect(usages[usages.length - 1].package_id).toEqual(91);
    });

    describe('input validation', function() {
      let req;
      let res;
      let next;

      beforeEach(function() {
        mock.db.getProject = jasmine
          .createSpy('getProject')
          .and.callFake(
            x => x === 'abcd' && Promise.resolve(makeFakeDBProject())
          );
        mock.packagedb.getPackage = jasmine
          .createSpy('getPackage')
          .and.callFake(x => x === 90 && Promise.resolve(makeFakeDBPackage()));

        req = makeDummyRequest();
        res = jasmine.createSpy('res');
        next = jasmine.createSpy('next');
      });

      it('checks for undefined fields', async function() {
        req.body.version = undefined;
        await validators.attachPackage(req, res, next);
        expect(next.calls.first().args[0].message).toMatch(/Missing.*version/);
      });

      it('checks for empty-like licenses', async function() {
        req.body.licenseText = '       ';
        await validators.attachPackage(req, res, next);
        expect(req.body.licenseText).toBeUndefined();
      });

      it('checks URL format', async function() {
        req.body.website = 'not-a-url';
        await validators.attachPackage(req, res, next);
        expect(next.calls.first().args[0].message).toContain('URL');
      });

      it('looks for license text or name', async function() {
        req.body.license = undefined;
        req.body.licenseText = undefined;
        await validators.attachPackage(req, res, next);
        expect(next.calls.first().args[0].message).toContain(
          'license name or full text'
        );
      });

      it('requires usage info', async function() {
        req = makeDummyRequest();
        req.body.usage = undefined;
        await validators.attachPackage(req, res, next);
        expect(next.calls.first().args[0].message).toContain(
          'usage information'
        );
      });

      it('checks for required questions', async function() {
        req.body.license = 'MyCustomLicense';
        req.body.usage.link = undefined; // "linkage" tag is on MyCustomLicense
        await validators.attachPackage(req, res, next);
        expect(next.calls.first().args[0].message).toContain(
          'question "Linkage"'
        );
      });

      it('validates question answers', async function() {
        req.body.license = 'MyCustomLicense';
        req.body.usage.link = 'wat'; // "linkage" tag is on MyCustomLicense
        await validators.attachPackage(req, res, next);
        expect(next.calls.first().args[0].message).toContain(
          'question "Linkage" is not valid'
        );
      });

      it('packageId must be coerced', async function() {
        req.body.packageId = '90';
        await validators.attachPackage(req, res, next);
        expect(mock.packagedb.getPackage).toHaveBeenCalled();
        const [packageId] = mock.packagedb.getPackage.calls.first().args;
        expect(packageId).toBe(90);
      });
    });

    it('should ensure the project itself exists', async function() {
      mock.db.getProject = jasmine
        .createSpy('getProject')
        .and.callFake(x => x === 'abcd' && Promise.resolve(undefined));
      mock.packagedb.getPackage = jasmine
        .createSpy('getPackage')
        .and.callFake(x => x === 90 && Promise.resolve(makeFakeDBPackage()));

      const req = makeDummyRequest();
      const res = jasmine.createSpy('res');
      const next = jasmine.createSpy('next');

      await validators.attachPackage(req, res, next);
      expect(next.calls.first().args[0].message).toMatch(/Project.*exist/);
    });

    it('should ensure the package being attached exists', async function() {
      mock.db.getProject = jasmine
        .createSpy('getProject')
        .and.callFake(
          x => x === 'abcd' && Promise.resolve(makeFakeDBProject())
        );
      mock.packagedb.getPackage = jasmine
        .createSpy('getPackage')
        .and.callFake(x => x === 90 && Promise.resolve(undefined));

      const req = makeDummyRequest();
      const res = jasmine.createSpy('res');
      const next = jasmine.createSpy('next');

      await validators.attachPackage(req, res, next);
      expect(next.calls.first().args[0].message).toMatch(/Package.*exist/);
    });

    function makeDummyRequest() {
      return {
        params: {
          projectId: 'abcd',
        },
        user: {
          user: 'fake person',
          groups: [],
        },
        body: {
          packageId: 90,
          name: 'pkg',
          version: '1.2.3',
          website: 'http://example.com',
          copyright: '(c) 20xx some person',
          license: 'MIT',
          licenseText: undefined,
          usage: {
            notes: 'blah blah',
            link: 'dynamic',
            modified: false,
          },
        },
      } as any;
    }


  });

  describe('replacePackage', function() {
    it('replaces a package ID and nothing else', async function() {
      mock.db.getProject = jasmine
        .createSpy('getProject')
        .and.callFake(
          x => x === 'abcd' && Promise.resolve(makeFakeDBProject())
        );
      mock.db.updatePackagesUsed = jasmine.createSpy('updatePackagesUsed');

      const req = makeDummyRequest();
      const res = makeDummyResponse(makeFakeDBProject());
      const next = jasmine.createSpy('next');

      await validators.replacePackage(req, res, next);

      await api.replacePackage(req, res);
      expect(mock.db.updatePackagesUsed).toHaveBeenCalled();
      const [projectId, usages] = mock.db.updatePackagesUsed.calls.first().args;
      expect(projectId).toEqual('abcd');
      expect(usages.length).toEqual(1);
      expect(usages[0].package_id).toEqual(91);
      expect(usages[0].notes).toEqual('blah blah');
    });

    function makeDummyRequest() {
      return {
        params: {
          projectId: 'abcd',
        },
        user: {
          user: 'fake person',
          groups: [],
        },
        body: {
          oldId: 90,
          newId: 91,
        },
      };
    }
  });

  function makeDummyResponse(project) {
    return {
      locals: {
        project,
      },
    };
  }

  function makeFakeDBProject() {
    return {
      project_id: 'abcd',
      title: 'my project',
      version: '9001',
      description: 'my special description',
      created_on: '2000-01-01 01:01:01',
      planned_release: '2001-01-01 01:01:01',
      contacts: { 'fake person': 'legal' },
      acl: { owngroup: 'owner' },
      packages_used: [
        { package_id: 90, modified: true, link: 'dynamic', notes: 'blah blah' },
      ],
      metadata: {},
    } as any;
  }

  function makeFakeDBPackage() {
    return {
      package_id: 90,
      name: 'pkg',
      version: '1.2.3',
      website: 'http://example.com',
      copyright: '(c) 20xx some person',
      license: 'MIT',
      license_text: undefined,
    } as any;
  }
});
