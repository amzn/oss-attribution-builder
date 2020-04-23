// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
      .filter((prop) => !['packageId', 'notes'].includes(prop))
      .map((prop) => `${prop}: ${this.props[prop]}`)
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
