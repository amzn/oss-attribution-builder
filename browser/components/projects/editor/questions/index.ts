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
import { TagQuestion } from '../../../../../server/licenses/interfaces';

export interface BaseProps {
  name: string;
  question: TagQuestion;
  value: string | boolean | number;
  onChange: (val: string | boolean | number) => any;
}

export class BaseWidget<T extends BaseProps> extends React.Component<T, {}> {

  protected coerceType(val: string): any {
    const { question: { type } } = this.props;

    let out: any;
    if (type === 'string') {
      out = val;
    } else if (type === 'boolean') {
      out = (val === 'true' || val === '1' || val === 'yes');
    } else if (type === 'number') {
      out = Number.parseInt(val);
    }

    return out;
  }

}
