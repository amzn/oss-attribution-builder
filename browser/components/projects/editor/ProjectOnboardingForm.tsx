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
import { AccessLevel } from '../../../../server/api/projects/interfaces';
import * as ProjectActions from '../../../modules/projects';
import GroupSelect from '../acl/GroupSelect';

interface Props {
  dispatch: (action: any) => any;
  groups: any[];
}

interface State {
  ownerGroup?: string;
}

class ProjectOnboardingForm extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      ownerGroup: undefined,
    };
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip({placement: 'bottom', container: 'body'});
  }

  handleSubmit = (e) => {
    const { dispatch } = this.props;
    e.preventDefault();

    const acl = this.state.ownerGroup ? {
      [this.state.ownerGroup]: 'owner' as AccessLevel,
    } : {};

    const fields = e.target.elements;
    dispatch(ProjectActions.createProject({
      title: fields.title.value,
      version: fields.version.value,
      description: fields.description.value,
      plannedRelease: fields.plannedRelease.value,
      contacts: {
        legal: [
          fields.legalContact.value,
        ],
      },
      acl,
      metadata: {
        open_sourcing: fields.openSourcing.value === 'true',
      },
    }));
  }

  render() {
    return (
      <div className="container">
        <form id="onboarding-form" onSubmit={this.handleSubmit}>
          <div className="row">
            <h2>Tell us about your project</h2>
          </div>

          <div className="form-group row">
            <label htmlFor="title" className="col-md-3 col-form-label">Title</label>
            <div className="col-md-7">
              <input type="text" id="title" className="form-control" required={true} />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="version" className="col-md-3 col-form-label">Version</label>
            <div className="col-md-7">
              <input type="text" id="version" className="form-control" required={true} />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="description" className="col-md-3 col-form-label">What does it do?</label>
            <div className="col-md-7">
              <textarea id="description" className="form-control" required={true} />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-md-3 col-form-label">Are you open sourcing any internal code?</label>
            <div className="col-md-7">
              <div className="form-check form-check-inline">
                <label className="form-check-label">
                  <input type="radio" name="openSourcing" value="true" required={true} /> Yes
                </label>
              </div>
              <div className="form-check form-check-inline">
                <label className="form-check-label">
                  <input type="radio" name="openSourcing" value="false" required={true} /> No
                </label>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="legalContact" className="col-md-3 col-form-label">
              Who is your legal contact?
            </label>
            <div className="col-md-7">
              <input type="text" id="legalContact" className="form-control" required={true} />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="plannedRelease" className="col-md-3 col-form-label">
              Planned release date
            </label>
            <div className="col-md-7">
              <input type="date" id="plannedRelease" className="form-control" placeholder="YYYY-MM-DD" required={true} />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="ownerGroup" className="col-md-3 col-form-label">
              Project owner (group)
            </label>
            <div className="col-md-7" id="ownerGroup-container">
              <GroupSelect
                name="ownerGroup"
                groups={this.props.groups}
                value={this.state.ownerGroup!}
                onChange={(val: any) => this.setState({ownerGroup: val})}
              />
            </div>
          </div>

          <div className="form-group row">
            <div className="col-md-7 offset-md-3">
              <button type="submit" className="btn btn-primary btn-lg">Next</button>
            </div>
          </div>

        </form>
      </div>
    );
  }
}

export default connect((state: any) => ({
  groups: state.common.info.groups ? state.common.info.groups : [],
}))(ProjectOnboardingForm);
