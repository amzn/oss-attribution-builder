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

app.start(config.server.port, config.server.hostname).then(() => {
  winston.info(`Server running on port ${config.server.port} [${process.env.NODE_ENV}]`);
}).catch((err) => console.error(err));
