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

// Meta-tag: this is applied to any license that doesn't match a "known"
// license (see the 'known' directory right next to this one)

// tslint:disable:no-empty no-var-requires

export function validateSelf(name, text, tags) {
  // less "confused" message for SPDX licenses
  if (tags.includes('spdx')) {
    return [
      {
        level: 1,
        message:
          `The attribution builder has the text of ${name}, ` +
          "but it doesn't have any additional instructions available. " +
          'Review this license carefully to ensure you comply with its terms.',
      },
    ];
  }

  const proper = name ? `${name}` : 'This license';
  return [
    {
      level: 1,
      message:
        `${proper} is not known by the attribution builder. ` +
        'Review it carefully to ensure you comply with its terms.',
    },
  ];
}

export function validateUsage(pkg, usage) {}

export const questions = {
  ...require('./linkage').questions,
  ...require('./modified').questions,
};
