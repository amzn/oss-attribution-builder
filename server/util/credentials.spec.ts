// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { selfDestruct } from './credentials';

describe('credentials', function() {
  describe('selfDestruct', function() {
    it('should return the called function value', function() {
      const x = () => 123;
      const modified = selfDestruct(x);
      expect(modified()).toEqual(123);
    });

    it('should throw after first call', function() {
      const x = () => 123;
      const modified = selfDestruct(x);
      modified();
      expect(modified).toThrowError(/destroyed/);
    });
  });
});
