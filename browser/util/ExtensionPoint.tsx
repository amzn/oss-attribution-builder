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

import { getExtensions } from '../ext';

interface Props {
  ext: string;
  children?: any;
  [p: string]: any;
}

interface State {
  crashed?: boolean;
}

export default class ExtensionPoint extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      crashed: false,
    };
  }

  componentDidCatch(error, info) {
    // tslint:disable:no-console
    console.error(`Extension at point ${this.props.ext} crashed.`);
    console.error('Component stack:', info.componentStack);
    this.setState({ crashed: true });
  }

  render() {
    if (this.state.crashed) {
      return (
        <div className="alert alert-danger">
          <strong>Bug:</strong> An extension that was supposed to render here
          crashed. Details may be available in the browser console.
        </div>
      );
    }

    const exts = getExtensions(this.props.ext);
    if (exts.length === 0) {
      // tslint:disable-next-line:no-null-keyword
      return this.props.children || null;
    }

    return exts.map((Ext, i) => (
      <Ext key={`ext-${this.props.ext}-${i}`} {...this.props} />
    ));
  }
}
