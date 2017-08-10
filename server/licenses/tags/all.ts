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
  // if it's an unknown license, the unknown tag will cover this case anyway
  if (tags.includes('unknown')) {
    return;
  }

  return [
    {level: 2, message: 'This sample message is applied to all known licenses.'},
  ];
}

export function validateUsage(usage) {
}
