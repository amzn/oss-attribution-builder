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

import * as fs from 'fs';
import * as path from 'path';

import * as Immutable from 'immutable';

export const knownLicenses = new Set();
fs.readdir(path.join(__dirname, 'known'), (err, files) => {
  if (err) {
    throw err;
  }

  for (const f of files) {
    if (f.endsWith('.js')) {
      knownLicenses.add(path.basename(f, '.js'));
    }
  }
});

const licenseCache = new Map();

export function mapLicense(name) {
  if (!knownLicenses.has(name)) {
    return null;
  }

  let cached = licenseCache.get(name);
  if (cached == null) {
    const info = require(`./known/${name}`);
    cached = Immutable.Map({
      tags: Immutable.List(info.tags),
      text: info.text.replace(/^\n+|\n+$/g, ''),
    });
    licenseCache.set(name, cached);
  }

  return cached.toJS();
}

const tagCache = new Map();

export function mapTag(name) {
  let mod = tagCache.get(name);
  if (mod == null) {
    mod = require(`./tags/${name}`);
    tagCache.set(name, mod);
  }

  return mod;
}
