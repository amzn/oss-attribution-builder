// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BaseProps, BaseWidget } from './index';

export default class RadioWidget extends BaseWidget<BaseProps> {
  private handleChange = e => {
    const val = this.coerceType(e.target.value);
    this.props.onChange(val);
  };

  private renderOption = (opt: [string | number | boolean, string]) => {
    const { name, value } = this.props;
    const [optVal, optLabel] = opt;
    return (
      <div key={optVal.toString()} className="form-check form-check-inline">
        <label className="form-check-label">
          <input
            type="radio"
            name={`q_${name}`}
            value={optVal.toString()}
            checked={value === optVal}
            onChange={this.handleChange}
            className="form-check-input"
          />{' '}
          {optLabel}
        </label>
      </div>
    );
  };

  render() {
    const { question } = this.props;

    return (
      <div className="form-group row">
        <label className="col-md-3">{question.label}</label>
        <div className="col-md-9">
          {question.options && question.options.map(this.renderOption)}
        </div>
      </div>
    );
  }
}
