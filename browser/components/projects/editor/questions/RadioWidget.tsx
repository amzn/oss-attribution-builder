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
import { BaseProps, BaseWidget } from './index';

export default class RadioWidget extends BaseWidget<BaseProps> {

  private handleChange = (e) => {
    const val = this.coerceType(e.target.value);
    this.props.onChange(val);
  }

  private renderOption = (opt: [string, string]) => {
    const { name, value } = this.props;
    const [optVal, optLabel] = opt;
    return <div key={optVal} className="form-check form-check-inline">
      <label className="form-check-label">
        <input type="radio" name={`q_${name}`} value={optVal}
          checked={value === optVal} onChange={this.handleChange}
          className="form-check-input"
        /> {optLabel}
      </label>
    </div>;
  }

  render() {
    const { question } = this.props;

    return <div className="form-group row">
      <label className="col-md-3">{question.label}</label>
      <div className="col-md-9">
        {question.options.map(this.renderOption)}
      </div>
    </div>;
  }

}
