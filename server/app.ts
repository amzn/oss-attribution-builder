// Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import 'core-js/shim';
import 'source-map-support/register';

import * as path from 'path';

import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import * as passport from 'passport';
import * as winston from 'winston';

import { router as apiRoutes } from './api/routes';
import auth from './auth';
import { config, load } from './config';
import { globalCustomMiddleware } from './custom';
import { connect } from './db';

// install a crash handler to log errors
process.on('uncaughtException', err => {
  winston.error('FATAL exception: ' + err);
  winston.error(err.stack);
  process.exit(99);
});

// let's get this runnin
const app = express();

// apply a security policy for general scripts.
// webpack uses eval() for cheap source maps, so don't enable during development.
// don't use it with selenium, either, since it needs eval() to do a bunch of things.
if (config.server.contentSecurityPolicy) {
  app.use((req, res, next) => {
    res.set('Content-Security-Policy', config.server.contentSecurityPolicy);
    return next();
  });
} else {
  winston.warn('Content-Security-Policy disabled');
}

// CORS
if (config.server.cors) {
  if (config.server.cors === true) {
    winston.warn('Allowing CORS for any origin');
    app.use(cors());
  } else if (typeof config.server.cors === 'string') {
    app.use(cors({ origin: config.server.cors }));
  }
}

// auth
app.use(passport.initialize());
auth.initialize(app, passport);

// optional custom middleware
app.use(globalCustomMiddleware);

// api/logic
app.use('/api', apiRoutes);

// static stuff
app.use(compression());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/res', express.static(path.join(__dirname, '../res')));

// catch-all for client-side routes
app.use('/', (req, res) => {
  res.sendFile(__dirname + '/assets/template.html');
});

/**
 * Load app configuration, initialize, and listen.
 */
export const start = async function(port, hostname) {
  winston.info('Starting up...');

  // wait for configuration to resolve
  try {
    await load();
  } catch (ex) {
    winston.error(ex);
    throw ex;
  }

  // connect to postgresql
  connect({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password(),
    ssl: config.database.ssl,
  });

  winston.info('Configuration ready; launching HTTP server');

  // go!
  app.listen(port, hostname);
};

export default app;
