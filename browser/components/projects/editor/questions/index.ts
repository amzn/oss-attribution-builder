// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { TagQuestion } from '../../../../../server/licenses/interfaces';

export interface BaseProps {
  name: string;
  question: TagQuestion;
  value: string | boolean | number;
  onChange: (val: string | boolean | number) => any;
}

export class BaseWidget<T extends BaseProps> extends React.Component<T, {}> {
  protected coerceType(val: string): any {
    const {
      question: { type },
    } = this.props;

    let out: any;
    if (type === 'string') {
      out = val;
    } else if (type === 'boolean') {
      out = val === 'true' || val === '1' || val === 'yes';
    } else if (type === 'number') {
      out = Number.parseInt(val);
    }

    return out;
  }
}
