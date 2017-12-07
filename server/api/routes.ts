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

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as winston from 'winston';

import { userInfo } from '../auth';
import * as licenseAPI from './licenses';
import * as packageAPI from './packages';
import * as projectAPI from './projects';
import * as projectValidators from './projects/validators';

export let router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true,
}));

/**
 * Send API call results, calling error middleware on failure.
 */
function pack(promise: Promise<any>, res: any | undefined, next: any | undefined) {
  if (!res || !next) {
    throw new Error('Missing response or next middleware parameters');
  }
  return promise
    .then((x) => {
      if (x === null) {
        res.status(404).send('Object not found');
      } else {
        res.send(x);
      }
    })
    .catch(next);
}

/*** User/session/general info ***/
router.get('/info', async (req, res, next) => {
  await pack(userInfo(req), res, next);
});

/*** Projects ***/

/**
 * List all projects filtered by access.
 */
router.get('/projects', async (req, res, next) => {
  await pack(projectAPI.searchProjects(req), res, next);
});

/**
 * Create a new project.
 */
router.post('/projects/new', projectValidators.createProject, async (req, res, next) => {
  await pack(projectAPI.createProject(req, req.body), res, next);
});

/**
 * Get a particular project.
 */
router.get('/projects/:projectId', async (req, res, next) => {
  await pack(projectAPI.getProject(req, req.params.projectId), res, next);
});

/**
 * Edit a project's basic details.
 */
router.patch('/projects/:projectId', projectValidators.patchProject, async (req, res, next) => {
  await pack(projectAPI.patchProject(req, req.params.projectId, req.body), res, next);
});

/**
 * Attach a package to a project, optionally creating or updating the package.
 */
router.post('/projects/:projectId/attach', projectValidators.attachPackage, async (req, res, next) => {
  await pack(projectAPI.attachPackage(req, req.params.projectId, req.body), res, next);
});

/**
 * Detach a package from a project.
 */
router.post('/projects/:projectId/detach', async (req, res, next) => {
  await pack(projectAPI.detachPackage(req, req.params.projectId, req.body.packageId), res, next);
});

/**
 * Replace a package instance with another, without changing the usage.
 */
router.post('/projects/:projectId/replace', projectValidators.replacePackage, async (req, res, next) => {
  await pack(projectAPI.replacePackage(req, req.params.projectId, req.body.oldId, req.body.newId), res, next);
});

/**
 * Build an attribution document. Return the document along
 * with any warnings.
 */
router.get('/projects/:projectId/build', async (req, res, next) => {
  await pack(projectAPI.generateAttributionDocument(req, req.params.projectId), res, next);
});

/**
 * Building a document using POST will trigger a store & download.
 */
router.post('/projects/:projectId/build', async (req, res, next) => {
  await pack(projectAPI.generateAttributionDocument(req, req.params.projectId, true), res, next);
});

/*** Packages ***/

/**
 * Search all packages by name/version.
 */
router.post('/packages/', async (req, res, next) => {
  await pack(packageAPI.searchPackages(req, req.body.query), res, next);
});

/**
 * Admin action: fetch the package verification queue.
 */
router.get('/packages/verification', async (req, res, next) => {
  await pack(packageAPI.getVerificationQueue(req), res, next);
});

/**
 * Get a single package.
 */
router.get('/packages/:packageId', async (req, res, next) => {
  await pack(packageAPI.getPackage(req, req.params.packageId, req.query.extended != null), res, next);
});

/**
 * Verify (accept/reject with comments) a single package.
 */
router.post('/packages/:packageId/verify', async (req, res, next) => {
  await pack(packageAPI.verifyPackage(req, req.params.packageId, req.body.verified, req.body.comments), res, next);
});

/*** Licenses ***/

/**
 * Retrieve all license and tag data.
 */
router.get('/licenses/', async (req, res, next) => {
  await pack(licenseAPI.listLicenses(), res, next);
});

// error handling for all of the above
router.use(function (err: any, req: any, res: any, next: any) {
  if (err.name === 'UnauthorizedError'
      || err.name === 'AccessError'
      || err.name === 'RequestError') {
    res.status(err.status).send({error: err.message});
    return;
  }

  winston.error(err.stack ? err.stack : err);
  res.status(500).send({error: 'Internal error.'});
});
