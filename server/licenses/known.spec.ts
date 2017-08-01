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

import { knownLicenses, mapLicense } from './index';

describe('known licenses', function () {

  it('declare required properties', function () {
    knownLicenses.forEach((name) => {
      const license = mapLicense(name);
      expect(license).toBeDefined();

      expect(Array.isArray(license.tags)).toBe(true);
      expect(typeof license.text).toEqual('string');
    });
  });

  it('used tags must exist', function () {
    knownLicenses.forEach((name) => {
      const license = mapLicense(name);

      for (const tag of license.tags) {
        require(`./tags/${tag}`);
      }
    });
  });

});
