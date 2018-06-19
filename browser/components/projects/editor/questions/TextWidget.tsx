/* Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

export default class TextWidget extends BaseWidget<BaseProps> {

  private handleChange = (e) => {
    const val = this.coerceType(e.target.value);
    this.props.onChange(val);
  }

  render() {
    const { question, name, value } = this.props;

    return <div className="form-group row">
      <label className="col-md-3">{question.label}</label>
      <div className="col-md-9">
        <input type="text" name={`q_${name}`} value={value ? value.toString() : ''} className={'form-control'} onChange={this.handleChange} />
      </div>
    </div>;
  }

}
