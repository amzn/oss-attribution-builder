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

import { TagModule } from './interfaces';

const tagsDir = path.join(__dirname, 'tags');

describe('license tags', function() {
  const modules: TagModule[] = [];

  beforeAll(function(done) {
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

  it('should export validation functions', function() {
    for (const mod of modules) {
      expect(typeof mod.validateSelf).toEqual('function');
      expect(typeof mod.validateUsage).toEqual('function');
    }
  });

  it('may export a questions object', function() {
    for (const mod of modules) {
      if (mod.questions == undefined) {
        continue;
      }

      // runtime type checking, basically
      for (const key of Object.keys(mod.questions)) {
        const q = mod.questions[key];
        expect(q.label).toEqual(
          jasmine.any(String),
          'label key must be a string'
        );
        expect(q.required).toEqual(
          jasmine.any(Boolean),
          'required key must be a boolean'
        );
        expect(q.type).toMatch(/string|boolean|number/, 'type key mismatch');
        expect(q.widget).toMatch(/radio|text|select/, 'widget key mismatch');

        if (q.options) {
          expect(q.options).toEqual(
            jasmine.any(Array),
            'options must be an array if present'
          );
          for (const opt of q.options) {
            expect(opt.length).toEqual(
              2,
              'options array items must be 2-tuple arrays'
            );
            expect(opt[0]).toBeDefined();
            expect(opt[1]).toEqual(jasmine.any(String));
          }
        }
      }
    }
  });
});
