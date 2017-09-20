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
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';

import { WebProject } from '../../../server/api/projects/interfaces';
import * as ProjectActions from '../../modules/projects';
import ProjectAclEditor from './acl/ProjectAclEditor';
import ProjectView from './editor/ProjectView';
import AttributionDocBuilder from './render/AttributionDocBuilder';

interface Props {
  dispatch: (action: any) => any;
  match: any;
  project: WebProject;
}

class ProjectRouter extends React.Component<Props, {}> {

  componentWillMount() {
    const { dispatch, match: { params } } = this.props;
    dispatch(ProjectActions.fetchProjectDetail(params.projectId));
  }

  componentWillUpdate(nextProps) {
    const { dispatch, match: { params } } = this.props;
    if (params.projectId === nextProps.match.params.projectId) {
      return;
    }

    dispatch(ProjectActions.fetchProjectDetail(nextProps.match.params.projectId));
  }

  render() {
    const { project, match: { params: { projectId } } } = this.props;

    if (project == null || projectId !== project.projectId) {
      return <div className="text-muted">Loading project information...</div>;
    }

    return <div>
      <nav className="breadcrumb">
        <Link to={`/projects/${projectId}`} className="breadcrumb-item">Project Editor</Link>
        <Route path="/projects/:projectId/build" render={() =>
          <span className="breadcrumb-item active">Attribution Document</span>
        } />
        <Route path="/projects/:projectId/acl" render={() =>
          <span className="breadcrumb-item active">Access List</span>
        } />
      </nav>
      <Switch>
        <Route exact path="/projects/:projectId" component={ProjectView} />
        <Route path="/projects/:projectId/acl" component={ProjectAclEditor} />
        <Route path="/projects/:projectId/build" component={AttributionDocBuilder} />
      </Switch>
    </div>;
  }

}

export default connect((state) => ({
  project: state.projects.active,
}))(ProjectRouter);
