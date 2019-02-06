// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { register } from '../ext';

register('footer', props => {
  return (
    <div className="mt-5 pt-3 border-top">
      <div className="alert alert-light">
        <a href="https://github.com/amzn/oss-attribution-builder">
          oss-attribution-builder
        </a>{' '}
        is running in demo/development mode. Be sure to{' '}
        <a href="https://github.com/amzn/oss-attribution-builder/blob/master/README.md">
          configure the website
        </a>{' '}
        before deploying to production.
      </div>
    </div>
  );
});
