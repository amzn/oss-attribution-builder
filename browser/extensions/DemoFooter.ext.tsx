// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { register } from '../ext';

register('footer', props => {
  return (
    <div>
      <a href="https://github.com/amzn/oss-attribution-builder">
        oss-attribution-builder demo
      </a>
    </div>
  );
});
