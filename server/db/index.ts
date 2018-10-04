// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as pgPromise from 'pg-promise';

const options = {};

// note: pg-monitor isn't installed in prod; this doesn't work there intentionally.
if (process.env.DEBUG_SQL) {
  // tslint:disable-next-line:no-var-requires
  const monitor = require('pg-monitor');
  monitor.attach(options);
}

const pgp = pgPromise(options);
let pg: pgPromise.IDatabase<any>;

export function connect(cn: any) {
  pg = pgp(cn);
}

export default function getDB() {
  return pg;
}
