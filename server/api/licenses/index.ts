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

import { licenses, mapTag } from '../../licenses';
import { WebLicense, WebTag } from './interfaces';

interface LicenseResponse {
  licenses: WebLicense[];
  tags: {[key: string]: WebTag};
}

let cachedLicenses: WebLicense[] = [];
const cachedTags: {[key: string]: WebTag} = {};

export async function listLicenses(): Promise<LicenseResponse> {
  // this is _slightly_ expensive, so cache it
  if (cachedLicenses.length === 0) {
    cacheLicenseData();
  }

  return {
    licenses: cachedLicenses,
    tags: cachedTags,
  };
}

function cacheLicenseData() {
    // a little silly, but keep two license lists; one for those that ask to be
    // displayed first and the other for those that don't care
    const first = [];
    const rest = [];

    // load each license...
    for (const [id, data] of (licenses as any).entries()) {
      const tags = data.get('tags');

      // fill the tag cache as we go
      let sortFirst = false;
      for (const tag of tags) {
        const mod = mapTag(tag);
        cachedTags[tag] = {
          presentation: mod.presentation,
          questions: mod.questions,
        };

        // check the sort option, since we handle that part server-side
        if (mod.presentation && mod.presentation.sortFirst) {
          sortFirst = true;
        }
      }

      const item = {
        name: id,
        tags,
      };

      // send it to either of the lists by presentation preference
      if (sortFirst) {
        first.push(item);
      } else {
        rest.push(item);
      }
    }

    cachedLicenses = first.concat(rest);
}
