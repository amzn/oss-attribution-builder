// Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as express from 'express';
import * as winston from 'winston';
import * as swaggerUi from 'swagger-ui-express';

import v1Router from './routes-v1';
import config from '../config';

export let router = express.Router();
router.use(express.json({ limit: config.server.maxRequestSize }));

// actual APIs are versioned
router.use('/v1', v1Router);

// api docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(require('./openapi.json'), {
  customCss: '.swagger-ui .topbar { display: none }'
});

// unprefixed v1 routes
router.use((req, res, next) => {
  winston.warn(`Deprecated API URL used: ${req.path} -- prefix with /v1/`);
  next();
});
router.use(v1Router);

// error handling for all of the above
router.use((err: any, req: any, res: any, next: any) => {
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
