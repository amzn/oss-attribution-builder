#!/usr/bin/env node
// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// tslint:disable:no-var-requires no-console

import winston = require('winston');
winston.configure({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(
      info => `[${info.timestamp} ${info.level}] ${info.message}`
    )
  ),
});

if (process.env.NODE_ENV === 'development') {
  winston.level = 'debug';
  winston.warn('Starting in development mode');
}

// use require() instead of import to set env beforehand
const config = require('./config').default;
const app = require('./app');

app
  .start(config.server.port, config.server.hostname)
  .then(() => {
    winston.info(
      `Server running on port ${config.server.port} [${process.env.NODE_ENV}]`
    );
  })
  .catch(err => console.error(err));
