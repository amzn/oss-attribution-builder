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
  highlight?: string | null;
  scrollTo?: boolean;
  children?: any;
}

export default class TextLine extends Component<Props, {}> {

  render() {
    const { children, highlight, scrollTo } = this.props;

    const classes = highlight != null ? highlight : '';

    function scrollRef(r) {
      if (r == null) {
        return;
      }
      window.scrollTo(0, r.offsetTop);
    }

    return (
      <div ref={scrollTo ? scrollRef : undefined} className={classes}>
        {children.length > 0 ? children : '\n'}
      </div>
    );
  }
}
