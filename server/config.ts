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
