// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import * as path from 'path';

import * as Immutable from 'immutable';
import * as winston from 'winston';
import { TagModule } from './interfaces';

type LicenseMap = Immutable.Map<string, Immutable.Map<string, any>>;

const tagCache = new Map<string, any>();

export const licenses: LicenseMap = loadLicenses();

export function mapTag(name): TagModule {
  let mod = tagCache.get(name);
  if (mod == undefined) {
    mod = require(`./tags/${name}`);
    tagCache.set(name, mod);
  }

  return mod;
}

function loadLicenses(): LicenseMap {
  const licenseMap = new Map<string, Immutable.Map<string, any>>();

  // start with SPDX licenses
  const spdxData = require('../../data/spdx-license-data.json');
  for (const id of Object.keys(spdxData)) {
    licenseMap.set(
      id,
      Immutable.fromJS({
        tags: ['all', 'spdx', 'unknown'],
        text: spdxData[id].text,
      })
    );
  }
  winston.info('Loaded %s SPDX licenses', licenseMap.size);

  // then load known/custom license data
  // overwriting SPDX is OK
  // Sync function used here; this is only called during app startup
  const files = fs.readdirSync(path.join(__dirname, 'known'));
  for (const f of files) {
    if (f.endsWith('.js')) {
      const id = path.basename(f, '.js');
      licenseMap.set(id, processKnownLicense(id, spdxData));
    }
  }
  winston.info('Loaded %s total licenses', licenseMap.size);

  return Immutable.fromJS(licenseMap);
}

function processKnownLicense(id: string, spdxData: any) {
  const info = require(`./known/${id}`);
  let text = info.text;
  const tags = info.tags.concat(['all']);

  // overwriting an SPDX license?
  if (spdxData.hasOwnProperty(id)) {
    winston.info('Overwriting SPDX license %s', id);
    if (info.text === true) {
      winston.info('Re-using %s license text', id);
      text = spdxData[id].text;
      tags.push('spdx'); // restore spdx tag if opting in to text
    }
  }

  if (typeof text !== 'string') {
    throw new Error(
      `License ${id} neither supplied license text, nor referenced SPDX text`
    );
  }

  // trim excess newlines from start and end
  text = text.replace(/^\n+|\n+$/g, '');

  return Immutable.fromJS({ tags, text });
}
