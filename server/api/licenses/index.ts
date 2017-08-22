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
import { LicensePresentation, WebLicense } from './interfaces';

let cachedLicenses: WebLicense[] = [];

export async function listLicenses(): Promise<WebLicense[]> {
  // this is _slightly_ expensive, so cache it
  if (cachedLicenses.length === 0) {
    // a little silly, but keep two license lists; one for those that ask to be
    // displayed first and the other for those that don't care
    const first = [];
    const rest = [];

    // load each license...
    for (const [id, data] of (licenses as any).entries()) {
      // and their tag data
      const item = {
        name: id,
        tags: data.get('tags'),
        presentation: collectTagPresentations(data.get('tags')),
      };
      // send it to either of the lists by presentation preference
      if (item.presentation && item.presentation.sortFirst) {
        first.push(item);
      } else {
        rest.push(item);
      }
    }

    cachedLicenses = first.concat(rest);
  }

  return cachedLicenses;
}

/**
 * Mash individual tags' presentation fields into one when displaying a license.
 */
function collectTagPresentations(tags: string[]): LicensePresentation | undefined {
  const presentation: LicensePresentation = {};

  for (const tag of tags) {
    const mod = mapTag(tag);
    const p = mod.presentation;
    if (p) {
      if (p.sortFirst) {
        presentation.sortFirst = true;
      }
      if (p.fixedText) {
        presentation.fixedText = true;
      }
      if (p.shortText) {
        presentation.shortText = presentation.shortText || [];
        presentation.shortText.push(p.shortText);
      }
      if (p.longText) {
        presentation.longText = presentation.longText || [];
        presentation.longText.push(p.longText);
      }
    }
  }

  // don't return anything if it's empty (no need to flood the JSON output, basically)
  if (Object.keys(presentation).length === 0) {
    return;
  }

  return presentation;
}
