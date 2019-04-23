// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as express from 'express';

import { licenses, mapTag } from '../../../licenses';
import { asyncApi } from '../../../util/middleware';
import { WebLicense, WebTag } from './interfaces';

export const router = express.Router();
export default router;

let cachedLicenses: WebLicense[] = [];
const cachedTags: { [key: string]: WebTag } = {};

/**
 * Retrieve all license and tag data.
 */
router.get(
  '/',
  asyncApi(async (req, res) => {
    // this is _slightly_ expensive, so cache it
    if (cachedLicenses.length === 0) {
      cacheLicenseData();
    }

    return {
      licenses: cachedLicenses,
      tags: cachedTags,
    };
  })
);

function cacheLicenseData() {
  // a little silly, but keep two license lists; one for those that ask to be
  // displayed first and the other for those that don't care
  const first: any[] = [];
  const rest: any[] = [];

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
