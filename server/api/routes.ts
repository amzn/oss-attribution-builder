// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as express from 'express';
import * as winston from 'winston';

import { userInfo } from '../auth';
import licensesRouter from './licenses';
import packagesRouter from './packages';
import projectsRouter from './projects';
import { asyncApi } from '../util/middleware';

export let router = express.Router();

// all of these formats are JSON
router.use(express.json());

// basic site/user info route
router.get('/info', asyncApi(userInfo));

// sub-routers
router.use('/projects', projectsRouter);
router.use('/packages', packagesRouter);
router.use('/licenses', licensesRouter);

// error handling for all of the above
router.use(function(err: any, req: any, res: any, next: any) {
  if (
    err.name === 'UnauthorizedError' ||
    err.name === 'AccessError' ||
    err.name === 'RequestError'
  ) {
    res.status(err.status).send({ error: err.message });
    return;
  }

  winston.error(err.stack ? err.stack : err);
  res.status(500).send({ error: 'Internal error' });
});

// 404 handler (for API-specific routes)
router.use((req, res, next) => {
  res.status(404).send({ error: 'Not a valid route' });
});
