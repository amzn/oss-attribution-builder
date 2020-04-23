// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { List } from 'immutable';
import { licenses } from './index';

describe('known licenses', function () {
  it('declare required properties', function () {
    for (const [name, data] of (licenses as any).entries()) {
      const license = name;
      expect(license).toBeDefined();

      expect(List.isList(data.get('tags'))).toBe(
        true,
        `license ${name}'s tags property was not a list`
      );
      expect(typeof data.get('text')).toEqual(
        'string',
        `license ${name}'s text was not a string`
      );
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
