/* Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

const DocBuilder = require('../lib').default;
const TextRenderer = require('../lib/outputs/text').default;
const JSONSource = require('../lib/inputs/json').default;

const renderer = new TextRenderer();
const builder = new DocBuilder(renderer);

const packageData = JSON.stringify({
  packages: [
    {
      name: 'Test Package',
      version: '1.0',
      license: 'MIT',
    },
  ],
});

const source = new JSONSource(packageData);
builder.read(source);

const output = builder.build();
const annotations = renderer.annotations;

console.log(output);
console.log(annotations);
