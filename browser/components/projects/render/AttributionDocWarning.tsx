// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';

interface Props {
  warning?: any;
  onClick?: any;
}

export default class AttributionDocWarning extends Component<Props, {}> {
  render() {
    const { warning, onClick } = this.props;
    const { level, message } = warning;

    // figure out what this is all about
    let thing;
    if (warning.license != undefined) {
      thing = 'used license';
    } else if (warning.package != undefined) {
      thing = `package ${warning.label}`;
    } else {
      thing = 'project';
    }

    // build a message based on severity
    let title;
    let css;
    switch (level) {
      case 0:
        title = `Problem in ${thing}`;
        css = 'danger';
        break;
      case 1:
        title = `Potential issue in ${thing}`;
        css = 'warning';
        break;
      case 2:
        title = `Note for ${thing}`;
        css = 'info';
        break;
    }

    return (
      <div className={`document-warning alert alert-${css}`} onClick={onClick}>
        <h5 className="alert-heading">{title}</h5>
        <p className="mb-0">{message}</p>
      </div>
    );
  }
}
