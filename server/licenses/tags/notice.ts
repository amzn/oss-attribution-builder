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

// indicates that software using this license generally has a NOTICE file
// these notices will be rendered under the license text.
// largely Apache-2.0 specific.

export function validateSelf(name, text, tags) {
}

export function validateUsage(usage) {
}

// we strip out the original copyright text up top
export function transformCopyright(original) {
  return '';
}

// ...and place it at the bottom
export function transformLicense(original, packages) {
  const notices = [];
  for (const pkgBundle of packages) {
    const { pkg } = pkgBundle;

    const indented = pkg.copyright.replace(/^|\n/g, '\n    ');
    const notice = `* For ${pkg.name} see also this required NOTICE:${indented}`;

    notices.push(notice);
  }

  const noticeText = notices.join('\n');
  return `${original}\n\n${noticeText}`;
}
