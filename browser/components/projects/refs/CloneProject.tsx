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
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';
import { WebProject } from '../../../../server/api/projects/interfaces';
import GroupSelect from '../acl/GroupSelect';
// import history from '../../../history';
// import * as ProjectActions from '../../../modules/projects';

interface Props {
  dispatch: (action: any) => any;
  project: WebProject;
  groups: string[];
}

interface State {
  ownerGroup?: string;
}

class CloneProject extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  cloneSubmit = e => {};

  render() {
    const { project } = this.props;

    return (
      <form onSubmit={this.cloneSubmit}>
        <h2>
          Clone {project.title} <small>{project.version}</small>
        </h2>

        <p>
          You are about to clone{' '}
          <strong>
            "{project.title}" (version "{project.version}
            ")
          </strong>{' '}
          into a new project. Your new project will be completely separate from
          the project you're cloning; it won't receive updates when the original
          has been updated.
        </p>
        <p>
          If you want to instead combine multiple projects together into a
          single attribution document, consider linking the projects together.
          (LINK TODO)
        </p>
        <p>
          Pick a new title and version for your project, and then select a group
          that will own the project.
        </p>

        <div className="form-group row">
          <label htmlFor="title" className="col-md-3 col-form-label">
            New Title
          </label>
          <div className="col-md-7">
            <input
              type="text"
              id="title"
              className="form-control"
              required={true}
              defaultValue={project.title}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="version" className="col-md-3 col-form-label">
            New Version
          </label>
          <div className="col-md-7">
            <input
              type="text"
              id="version"
              className="form-control"
              required={true}
              defaultValue={project.version}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="ownerGroup" className="col-md-3 col-form-label">
            New Project Owner (group)
          </label>
          <div className="col-md-7" id="ownerGroup-container">
            <GroupSelect
              name="ownerGroup"
              groups={this.props.groups}
              value={this.state.ownerGroup!}
              onChange={(val: any) => this.setState({ ownerGroup: val })}
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-md-7 offset-md-3">
            <input type="checkbox" id="keepAcl" /> Keep current permissions too{' '}
            <Link to={`/projects/${project.projectId}/acl`} target="_blank">
              (view)
            </Link>
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Clone
        </button>
      </form>
    );
  }
}

export default connect((state: any) => ({
  project: state.projects.active,
  groups: state.common.info.groups ? state.common.info.groups : [],
}))(CloneProject);
