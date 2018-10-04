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
import { Component } from 'react';

export interface Props {
  notes?: string;
  [key: string]: string | boolean | number | undefined;
}

export default class PackageCardUsage extends Component<Props, {}> {
  render() {
    const { notes } = this.props;

    const usage = Object.keys(this.props)
      .filter(prop => !['packageId', 'notes'].includes(prop))
      .map(prop => `${prop}: ${this.props[prop]}`)
      .join('; ');

    return (
      <div>
        {usage && <em>In this project: {usage}</em>}
        <p style={{ whiteSpace: 'pre-wrap' }} className="text-muted mb-0">
          {notes}
        </p>
      </div>
    );
  }
}
