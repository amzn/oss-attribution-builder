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

import React = require('react');

import { PackageUsage } from '../../../../server/api/projects/interfaces';
import { TagQuestions } from '../../../../server/licenses/interfaces';
import QuestionWidget from './questions/QuestionWidget';

interface Props {
  initial?: Partial<PackageUsage>;
  onChange: (usage: Partial<PackageUsage>) => void;
  questions: TagQuestions;
}

interface State {
  usage: Partial<PackageUsage>;
}

export default class UsageFields extends React.Component<Props, State> {
  static defaultProps = {
    initial: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      usage: { ...this.props.initial },
    };
  }

  handleChange = (name, val) => {
    this.setState(
      {
        usage: {
          ...this.state.usage,
          [name]: val,
        },
      },
      () => {
        this.props.onChange(this.state.usage);
      }
    );
  };

  renderQuestion = (name: string, i: number) => {
    const { questions } = this.props;
    return (
      <QuestionWidget
        key={i}
        name={name}
        question={questions[name]}
        value={this.state.usage[name]!}
        onChange={(val: any) => this.handleChange(name, val)}
      />
    );
  };

  render() {
    const { questions } = this.props;
    const { usage } = this.state;

    return (
      <div>
        <div>{Object.keys(questions).map(this.renderQuestion)}</div>

        <div className="form-group row">
          <label htmlFor="packageComments" className="col-md-3">
            Additional comments
          </label>
          <div className="col-md-9">
            <textarea
              name="notes"
              id="packageComments"
              className="form-control"
              value={usage.notes}
              onChange={e => this.handleChange('notes', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }
}
