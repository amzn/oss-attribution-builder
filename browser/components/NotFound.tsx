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

import * as React from 'react';
import { match } from 'react-router';

import ExtensionPoint from '../util/ExtensionPoint';

interface Props {
  match: match<any>;
}

const Landing: React.SFC<Props> = (props) => {
  return (
    <div className="card bg-warning mb-2">
      <div className="card-header">Not Found</div>
      <div className="card-body">
        <ExtensionPoint ext="page-not-found" match={props.match}>
          <h4 className="card-title">Page not found</h4>
          <p className="card-text">
            The resource you were looking for doesn't exist here.
            Check your location for typos and try again.
          </p>
        </ExtensionPoint>
      </div>
    </div>
  );
};
export default Landing;
