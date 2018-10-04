// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { match } from 'react-router';

import ExtensionPoint from '../util/ExtensionPoint';

interface Props {
  match: match<any>;
}

const Landing: React.SFC<Props> = props => {
  return (
    <div className="card bg-warning mb-2">
      <div className="card-header">Not Found</div>
      <div className="card-body">
        <ExtensionPoint ext="page-not-found" match={props.match}>
          <h4 className="card-title">Page not found</h4>
          <p className="card-text">
            The resource you were looking for doesn't exist here. Check your
            location for typos and try again.
          </p>
        </ExtensionPoint>
      </div>
    </div>
  );
};
export default Landing;
