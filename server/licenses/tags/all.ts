import { ValidationResult } from '../interfaces';

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
 * The 'all' tag is applied to all packages.
 *
 * Validation that checks for the presence/abscence of other tags can be set up here.
 */

// tslint:disable:no-empty

export function validateSelf(name, text, tags) {
  const warnings: ValidationResult[] = [];
  const nicename = name ? name : 'The provided license';

  // look for excessively long lines, but ignore SPDX-tagged licenses.
  // those are word wrapped after this validation happens
  // (keen eyes will note that this will never match SPDX-supplied texts since
  // the `text` parameter is user-supplied, but it _does_ match e.g. picking BSD-3-Clause
  // and pasting the license text in.)
  if (text.match(/.{100,}/) && !tags.includes('spdx')) {
    warnings.push({
      level: 1,
      message: `${nicename} contains long lines. Consider word-wrapping the text.`,
    });
  }

  // look for template markers
  if (text.match(/<<var/i)) {
    warnings.push({
      level: 0,
      message: `${nicename} appears to be a license template. Ensure you have the correct license text.`,
    });
  }

  // scan for stub lines from copy-paste mishaps
  if (text.match(/^\s*Copyright.*<(year|owner)>/i)) {
    // for some reason, BSD SPDX licenses include these, so they'll get removed in
    // that tag's transformLicense function. add a note that we're doing that.
    if (tags.includes('spdx')) {
      warnings.push({
        level: 1,
        message: `${nicename} had a stub copyright line (with "<year>", or "<owner>" markers) removed.`,
      });
    } else {
      warnings.push({
        level: 2,
        message: `${nicename} has a stub copyright line (with "<year>", or "<owner>" markers).`,
      });
    }
  }

  return warnings;
}

export function validateUsage(pkg, usage) {
}
