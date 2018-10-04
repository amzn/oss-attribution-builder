// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * A configuration loader that sources the actual configuration from the
 * environment, or the default configuration if not specified.
 */

const name = process.env.CONFIG_NAME || 'default';
// tslint:disable-next-line:no-var-requires
const actual = require(`../config/${name}.js`);

export let config = actual.config;
export let load = actual.load;

export default config;
