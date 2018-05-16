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

// tslint:disable:no-empty

import * as wordwrap from 'wordwrap';

// This tag notes that the license was pulled from SPDX sources.

export function validateSelf(name, text, tags) {}

export function validateUsage(pkg, usage) {}

export function transformLicense(original, packages) {
  let text = original;

  // SPDX BSD texts include a stub copyright line for some reason. remove those.
  // see the `all` tag for a general warning applied to these.
  text = text.replace(/^\s*Copyright.*<(year|owner)>.*[\r\n]*/i, '');

  return wordwrap(80)(text);
}
