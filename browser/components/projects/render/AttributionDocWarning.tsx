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
    if (warning.license != null) {
      thing = 'used license';
    } else if (warning.package != null) {
      thing = `package ${warning.package}`;
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
