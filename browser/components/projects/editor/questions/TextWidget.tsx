// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BaseProps, BaseWidget } from './index';

export default class TextWidget extends BaseWidget<BaseProps> {
  private handleChange = e => {
    const val = this.coerceType(e.target.value);
    this.props.onChange(val);
  };

  render() {
    const { question, name, value } = this.props;

    return (
      <div className="form-group row">
        <label className="col-md-3">{question.label}</label>
        <div className="col-md-9">
          <input
            type="text"
            name={`q_${name}`}
            value={value ? value.toString() : ''}
            className={'form-control'}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
}
