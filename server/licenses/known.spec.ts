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

import { licenses } from './index';

describe('known licenses', function () {

  it('declare required properties', function () {
    for (const [name, data] of (licenses as any).entries()) {
      const license = (name);
      expect(license).toBeDefined();

      expect(data.get('tags')).toBe(true);
      expect(typeof data.get('text')).toEqual('string');
    }
  });

  it('used tags must exist', function () {
    for (const data of (licenses as any).values()) {
      for (const tag of data.get('tags')) {
        require(`./tags/${tag}`);
      }
    }
  });

});
