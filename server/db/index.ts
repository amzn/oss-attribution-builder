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

import * as pgPromise from 'pg-promise';

const options = {};

// note: pg-monitor isn't installed in prod; this doesn't work there intentionally.
if (process.env.DEBUG_SQL) {
  // tslint:disable-next-line:no-var-requires
  const monitor = require('pg-monitor');
  monitor.attach(options);
}

const pgp = pgPromise(options);
let pg: pgPromise.IDatabase<any> = null;

export function connect(cn: any) {
  pg = pgp(cn);
}

export default function getDB() {
  return pg;
}
