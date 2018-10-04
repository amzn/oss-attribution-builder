// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// tslint:disable:no-var-requires no-console

import winston = require('winston');

if (process.env.NODE_ENV === 'development') {
  winston.level = 'debug';
  winston.warn('Starting in development mode');
}

// use require() instead of import to set env beforehand
const config = require('./config').default;
const app = require('./app');

if (process.env.NODE_ENV === 'development') {
  app.disableCSP();
}

app
  .start(config.server.port, config.server.hostname)
  .then(() => {
    winston.info(
      `Server running on port ${config.server.port} [${process.env.NODE_ENV}]`
    );
  })
  .catch(err => console.error(err));
