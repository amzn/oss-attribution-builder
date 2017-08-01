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
import { Package } from '../db/packages';
import { mapLicense, mapTag } from './index';

export default class DocBuilder {

  _buckets = new Map();
  _annotations = [];
  _openAnnotations = {};
  _lineNum = 0;
  _chunks = [];
  _warnings = [];

  constructor() {
  }

  addPackage(pkg: Package, usage) {
    // see if it's a known license
    const name = pkg.license;
    const license = mapLicense(name);

    // prefer package's license text
    let text = '';
    if (pkg.license_text != null && pkg.license_text.length > 0) {
      text = pkg.license_text;
    } else {
      // no provided license text => use our stored version if we have it
      text = license != null ? license.text : name;
    }

    // create a key based on the text (or name, if text is empty)
    const hash = DocBuilder.licenseHash(text);

    // sort unknown licenses at the end (~)
    const prefix = name || '';
    const key = license != null ? `${prefix}~${hash}` : `~${prefix}~${hash}`;

    // determine tags
    const tags = license != null ? license.tags : ['unknown'];
    tags.push('all');

    // create or add to a bucket
    const bucket = this._buckets.get(key) || {name, text, tags, packages: []};
    bucket.packages.push({pkg, usage});
    this._buckets.set(key, bucket);
  }

  build() {
    this._chunks = [];
    this._lineNum = 0;

    // go through each bucket (packages with same license)
    const sortedBuckets = Array.from(this._buckets.keys()).sort();
    for (const key of sortedBuckets) {
      const { name, text, tags, packages } = this._buckets.get(key);

      const mappedTags = tags.map((tagName) => {
        const mod = mapTag(tagName);
        this._addWarnings(mod.validateSelf(name, text, tags), {license: key, name});
        return mod;
      });

      // then sort the packages in the bucket to print out their copyright statements
      const sortedPackages = packages.sort((a, b) => a.pkg.name.localeCompare(b.pkg.name));

      // first output the copyright statements
      for (const pkgBundle of sortedPackages) {
        const { pkg, usage } = pkgBundle;
        let notice = pkg.copyright;

        for (const mod of mappedTags) {
          // attach any package-level warnings
          this._addWarnings(mod.validateUsage(pkg, usage), {packageId: pkg.package_id});

          // mangle the notice statement
          if (mod.transformCopyright != null) {
            notice = mod.transformCopyright(notice);
          }
        }

        let statement = `** ${pkg.name}; version ${pkg.version} -- ${pkg.website}`;
        if (notice.length > 0) {
          statement += `\n${notice}`;
        }

        this._startAnnotation('package', {packageId: pkg.package_id});
        this._addChunk(statement);
        this._endAnnotation('package');
      }

      // add on the license text
      let fullText = text;
      for (const mod of mappedTags) {
        if (mod.transformLicense != null) {
          fullText = mod.transformLicense(fullText, sortedPackages);
        }
      }

      this._addChunk('');
      this._startAnnotation('license', {license: key});
      this._addChunk(fullText);
      this._endAnnotation('license');

      this._addChunk('\n-----\n');
    }

    // chop off the last chunk and join up
    return this._chunks.slice(0, -1).join('\n');
  }

  _addChunk(str) {
    const len = str.split(/\r?\n/).length;
    this._lineNum += len;
    this._chunks.push(str);
  }

  _addWarnings(warnings, extra) {
    if (warnings != null) {
      if (!Array.isArray(warnings)) {
        throw new Error('Bug: Validator output should return an array of messages');
      }
      for (const w of warnings) {
        this._warnings.push(Object.assign({}, w, extra));
      }
    }
  }

  _startAnnotation(type, extra) {
    this._openAnnotations[type] = Object.assign({lines: [this._lineNum, null]}, extra);
  }

  _endAnnotation(type) {
    const open = this._openAnnotations[type];
    open.type = type;
    open.lines[1] = this._lineNum;
    this.annotations.push(open);
    delete this._openAnnotations[type];
  }

  /**
   * Get a list of annotations in the format:
   *   {lines: [start inclusive, end exclusive], type: type, ...extras}
   */
  get annotations() {
    return this._annotations;
  }

  get warnings() {
    return this._warnings;
  }

  get summary() {
    const licenses = {};
    const tags = {};
    this._buckets.forEach((b, key) => {
      licenses[key] = {
        packages: b.packages.map((p) => [p.pkg.name, p.pkg.version]),
        tags: b.tags,
      };
      for (const t of b.tags) {
        const partialTags = tags[t] || [];
        partialTags.push(key);
        tags[t] = partialTags;
      }
    });

    return {
      licenses,
      tags,
    };
  }

  /**
   * Given a license's text, normalize it and create a hash for de-duping.
   */
  static licenseHash(text) {
    const hash = createHash('sha256');

    // we *don't* care about spacing/formatting, but we *do* care about text.
    // so just strip out all whitespace/punctuation/specials for the digest.
    text = text.toLowerCase().replace(/\W+/gu, '');

    hash.update(text);
    return hash.digest('hex');
  }

}
