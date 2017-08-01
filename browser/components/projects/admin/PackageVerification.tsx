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
import { Component } from 'react';
import { connect } from 'react-redux';

import * as PackageActions from '../../../modules/packages';
import PackageCard from '../packages/PackageCard';

interface Props {
  dispatch: any;
  params: any;
  packages: PackageActions.PackageSet;
}

interface State {
  verify_website: boolean;
  verify_license: boolean;
  verify_copyright: boolean;
  comments: string;
}

class PackageVerification extends Component<Props, State> {

  allChecked = false;

  state = {
    verify_website: false,
    verify_license: false,
    verify_copyright: false,
    comments: '',
  };

  changeEvent = (name: string) => {
    return (e: any) => {
      // read the value, unless it's a checkbox
      let val = e.currentTarget.value;
      if (e.currentTarget.checked !== undefined) {
        val = e.currentTarget.checked;
      }

      this.setState({[name]: val} as State);
    };
  }

  renderVerifyOption = (name: string, text: string) => {
    const fullName = `verify_${name}`;
    return (
      <div className="checkbox">
        <label>
          <input type="checkbox" name={fullName} onChange={this.changeEvent(fullName)}
                checked={this.state[fullName]} /> {text}
        </label>
      </div>
    );
  }

  submitForm = (e: any) => {
    const { dispatch, params: { packageId } } = this.props;
    e.preventDefault();
    dispatch(PackageActions.verifyPackage(packageId, this.allChecked, this.state.comments));
  }

  validate = () => {
    this.allChecked = ['website', 'license', 'copyright']
      .map((x) => this.state[`verify_${x}`])
      .reduce((a, b) => a && b, true);

    return this.allChecked || this.state.comments.trim().length > 0;
  }

  render() {
    const { params: { packageId } } = this.props;

    const valid = this.validate();

    return (
      <div className="row">

        <div className="col-md-8">
          <PackageCard
            packageId={packageId}
            preStyle={{overflow: 'auto', maxHeight: '400px'}}
          />
        </div>

        <div className="col-md-4">
          <form onSubmit={this.submitForm}>
            {this.renderVerifyOption('license', 'License name/text is correct')}
            {this.renderVerifyOption('copyright', 'Copyright statement is correct')}
            {this.renderVerifyOption('website', 'Website is correct')}
            <div className="form-group">
              <label htmlFor="comments">Comments?</label>
              <textarea className="form-control" id="comments" name="comments"
                        onChange={this.changeEvent('comments')} value={this.state.comments} />
            </div>
            <div className="btn-group pull-right">
              <button className="btn btn-primary" type="submit" disabled={!valid}>Save</button>
            </div>
            {valid || (
              <div className="help-block">
                You must verify all items are valid, or provide comments explaining which are incorrect.
              </div>
            )}
          </form>
        </div>

      </div>
    );
  }

}

export default connect((state) => ({
  packages: state.packages.set,
}))(PackageVerification);
