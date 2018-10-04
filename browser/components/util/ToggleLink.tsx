// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';

interface Props {
  state: boolean;
  onClick: any;
}

export default class ToggleLink extends Component<Props, {}> {
  render() {
    const { state, onClick, children } = this.props;

    const icon = state ? 'fa fa-check-circle' : 'fa fa-times-circle-o';

    return (
      <button type="button" className="btn btn-link" onClick={onClick}>
        <i className={icon} /> {children}
      </button>
    );
  }
}
