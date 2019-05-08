// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BaseProps, BaseWidget } from './index';

export default class SelectWidget extends BaseWidget<BaseProps> {
  private handleChange = e => {
    const val = this.coerceType(e.target.value);
    this.props.onChange(val);
  };

  private renderOption = (opt: [string | number | boolean, string]) => {
    const [optVal, optLabel] = opt;
    return (
      <option key={optVal.toString()} value={optVal.toString()}>
        {optLabel}
      </option>
    );
  };

  render() {
    const { question, name, value } = this.props;

    return (
      <div className="form-group row">
        <label className="col-md-3">{question.label}</label>
        <div className="col-md-9">
          <select
            className="form-control"
            name={`q_${name}`}
            value={value ? value.toString() : undefined}
            onChange={this.handleChange}
          >
            {question.options && question.options.map(this.renderOption)}
          </select>
        </div>
      </div>
    );
  }
}
