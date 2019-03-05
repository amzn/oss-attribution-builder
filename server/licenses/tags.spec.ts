// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
