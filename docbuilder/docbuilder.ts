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

import { createHash } from 'crypto';
import uuidv4 from 'uuid/v4';
import spdxLicenses from 'spdx-license-list/full';

import { LicenseBucket, Package, PackagePair, Usage } from './structure';
import OutputRenderer from './outputs/base';

interface Annotation {
  lines: [number, number | undefined];
  [key: string]: any;
}

export default class DocBuilder {
  private buckets = new Map<string, LicenseBucket>();

  constructor(private renderer: OutputRenderer<string>) {}

  addPackage(pkg: Package, usage: Usage) {
    // add an identifier if not present
    if (!pkg.uuid) {
      pkg.uuid = uuidv4();
    }

    // see if it's a known license
    const name = pkg.license;
    const license = name ? spdxLicenses[name] : undefined;

    // prefer package's license text
    let text = '';
    if (pkg.text != undefined && pkg.text.length > 0) {
      text = pkg.text;
    } else {
      // no provided license text => use our stored version if we have it
      text = license != undefined ? license.licenseText : name;
    }

    // create a key based on the text (or name, if text is empty)
    const hash = DocBuilder.licenseHash(text);

    // sort unknown licenses at the end (~)
    const prefix = name || '';
    const id =
      license != undefined ? `${prefix}~${hash}` : `~${prefix}~${hash}`;

    // determine tags
    const tags: string[] = license != undefined ? license.tags : ['unknown'];

    // create or add to a bucket
    const bucket = this.buckets.get(id) || {
      id,
      name,
      text,
      tags,
      packages: [] as PackagePair[],
    };

    bucket.packages.push({ pkg, usage });
    this.buckets.set(id, bucket);
  }

  build() {
    const licenseBuckets = this.finalize();
    return this.renderer.render(licenseBuckets);
  }

  private finalize() {
    // sort buckets by id (name, roughly)
    const sortedBuckets = Array.from(this.buckets.keys())
      .sort()
      .map(id => {
        // sort packages in each bucket
        const bucket = this.buckets.get(id)!;
        bucket.packages.sort((a, b) => a.pkg.name.localeCompare(b.pkg.name));
        return bucket;
      });
    return sortedBuckets;
  }

  get summary() {
    const usedLicenses: any = {};
    const usedTags: any = {};
    this.buckets.forEach((b, key) => {
      usedLicenses[key] = {
        packages: b.packages.map(p => [p.pkg.name, p.pkg.version]),
        tags: b.tags,
      };
      for (const t of b.tags) {
        const partialTags = usedTags[t] || [];
        partialTags.push(key);
        usedTags[t] = partialTags;
      }
    });

    return {
      usedLicenses,
      usedTags,
    };
  }

  /**
   * Given a license's text, normalize it and create a hash for de-duping.
   */
  static licenseHash(text: string) {
    const hash = createHash('sha256');

    // we *don't* care about spacing/formatting, but we *do* care about text.
    // so just strip out all whitespace/punctuation/specials for the digest.
    text = text.toLowerCase().replace(/\W+/gu, '');

    hash.update(text);
    return hash.digest('hex');
  }
}
