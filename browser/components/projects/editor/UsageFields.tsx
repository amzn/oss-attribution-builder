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

interface Props {
  initial?: Partial<PackageUsage>;
  onChange: (usage: Partial<PackageUsage>) => void;
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
      usage: {...this.props.initial},
    };
  }

  handleChange = (e) => {
    let val = e.target.value;
    if (e.target.type === 'radio' && (val === 'yes' || val === 'no')) {
      val = val === 'yes';
    }

    this.setState({usage: {
      ...this.state.usage,
      [e.target.name]: val,
    }}, () => {
      this.props.onChange(this.state.usage);
    });
  }

  render() {
    const { usage } = this.state;

    return <div>
      <div className="form-group row">
        <label className="col-md-3">Modification</label>
        <div className="col-md-9">
          <div className="form-check form-check-inline">
            <label className="form-check-label">
              <input type="radio" name="modified" id="packageModifiedNo" value="no"
                checked={usage.modified === false} onChange={this.handleChange}
                className="form-check-input"
              /> Unmodified
            </label>
          </div>
          <div className="form-check form-check-inline">
            <label className="form-check-label">
              <input type="radio" name="modified" id="packageModifiedYes" value="yes"
                checked={usage.modified === true} onChange={this.handleChange}
                className="form-check-input"
              /> Modified from original
            </label>
          </div>
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3">
          Linkage{' '}
          <i className="fa fa-question-circle" data-toggle="tooltip"
            title={'If this doesn\'t apply to your product, pick the closest option. ' +
                   'Generally, static linking is when your code is bundled together by a ' +
                   'compiler/minifier into a single file, and dynamic linking keeps the ' +
                   'library in a separate file.'} />
        </label>
        <div className="col-md-9">
          <div className="form-check form-check-inline">
            <label className="form-check-label">
              <input type="radio" name="link" id="packageDynamicLink" value="dynamic"
                checked={usage.link === 'dynamic'} onChange={this.handleChange}
                className="form-check-input"
              /> Dynamically linked
            </label>
          </div>
          <div className="form-check form-check-inline">
            <label className="form-check-label">
              <input type="radio" name="link" id="packageStaticLink" value="static"
                checked={usage.link === 'static'} onChange={this.handleChange}
                className="form-check-input"
              /> Statically linked
            </label>
          </div>
        </div>
      </div>

      <div className="form-group row">
        <label htmlFor="packageComments" className="col-md-3">Additional comments?</label>
        <div className="col-md-9">
          <textarea name="notes" id="packageComments" className="form-control"
            value={usage.notes} onChange={this.handleChange} />
        </div>
      </div>
    </div>;
  }

}
