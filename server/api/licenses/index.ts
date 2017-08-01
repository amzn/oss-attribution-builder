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

import * as winston from 'winston';

import { knownLicenses, mapLicense } from '../../licenses';
import spdxLicenses from '../../licenses/spdx-ids';

let cachedLicenses: LicenseItem[];

export function listLicenses() {
  if (cachedLicenses == null) {
    cachedLicenses = buildLicenses();
  }

  return cachedLicenses;
}

interface LicenseItem {
  name: string;
  tags: string[];
}

export function buildLicenses(): LicenseItem[] {
  const list: LicenseItem[] = [];

  knownLicenses.forEach((license) => {
    const mapped = mapLicense(license);
    list.push({name: license, tags: mapped.tags});
  });

  spdxLicenses.forEach((license) => {
    if (knownLicenses.has(license)) {
      return;
    }
    list.push({name: license, tags: ['unknown']});
  });

  winston.info('Built license cache with %s items (spdx: %s, known: %s)',
    list.length, spdxLicenses.length, knownLicenses.size);
  return list;
}

export function getLicenseTitles() {
  return spdxLicenses;
}
