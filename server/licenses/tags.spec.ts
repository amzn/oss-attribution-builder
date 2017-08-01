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

const tagsDir = path.join(__dirname, 'tags');

describe('license tags', function () {

  const modules = [];

  beforeAll(function (done) {
    fs.readdir(tagsDir, (err, files) => {
      if (err) {
        throw err;
      }

      for (const f of files) {
        if (f.endsWith('.js')) {
          modules.push(require(path.join(tagsDir, f)));
        }
      }

      done();
    });
  });

  it('should export validation functions', function () {
    for (const mod of modules) {
      expect(typeof mod.validateSelf).toEqual('function');
      expect(typeof mod.validateUsage).toEqual('function');
    }
  });

});
