// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BaseProps, BaseWidget } from './index';
import RadioWidget from './RadioWidget';
import TextWidget from './TextWidget';

export default class QuestionWidget extends BaseWidget<BaseProps> {
  render() {
    const { question } = this.props;

    let Widget;
    if (question.widget === 'radio') {
      Widget = RadioWidget;
    } else if (question.widget === 'text') {
      Widget = TextWidget;
    }

    return <Widget {...this.props} />;
  }
}
