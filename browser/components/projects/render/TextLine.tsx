// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';

interface Props {
  highlight?: string;
  scrollTo?: boolean;
  children?: any;
}

export default class TextLine extends Component<Props, {}> {
  render() {
    const { children, highlight, scrollTo } = this.props;

    const classes = highlight != undefined ? highlight : '';

    function scrollRef(r) {
      if (r == undefined) {
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
