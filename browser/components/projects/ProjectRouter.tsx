// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';

import { WebProject } from '../../../server/api/projects/interfaces';
import * as ProjectActions from '../../modules/projects';
import ProjectAclEditor from './acl/ProjectAclEditor';
import ProjectView from './editor/ProjectView';
import CloneProject from './refs/CloneProject';
import AttributionDocBuilder from './render/AttributionDocBuilder';

interface Props {
  dispatch: (action: any) => any;
  match: any;
  project: WebProject;
}

class ProjectRouter extends React.Component<Props, {}> {
  componentWillMount() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(ProjectActions.fetchProjectDetail(params.projectId));
  }

  componentWillUpdate(nextProps) {
    const {
      dispatch,
      match: { params },
    } = this.props;
    if (params.projectId === nextProps.match.params.projectId) {
      return;
    }

    dispatch(
      ProjectActions.fetchProjectDetail(nextProps.match.params.projectId)
    );
  }

  render() {
    const {
      project,
      match: {
        params: { projectId },
      },
    } = this.props;

    if (project == undefined || projectId !== project.projectId) {
      return <div className="text-muted">Loading project information...</div>;
    }

    return (
      <div>
        <nav className="breadcrumb">
          <Link to={`/projects/${projectId}`} className="breadcrumb-item">
            Project Editor
          </Link>
          <Route
            path="/projects/:projectId/build"
            render={() => (
              <span className="breadcrumb-item active">
                Attribution Document
              </span>
            )}
          />
          <Route
            path="/projects/:projectId/acl"
            render={() => (
              <span className="breadcrumb-item active">Access List</span>
            )}
          />
          <Route
            path="/projects/:projectId/clone"
            render={() => <span className="breadcrumb-item active">Clone</span>}
          />
        </nav>
        <Switch>
          <Route
            exact={true}
            path="/projects/:projectId"
            component={ProjectView}
          />
          <Route path="/projects/:projectId/acl" component={ProjectAclEditor} />
          <Route
            path="/projects/:projectId/build"
            component={AttributionDocBuilder}
          />
          <Route path="/projects/:projectId/clone" component={CloneProject} />
        </Switch>
      </div>
    );
  }
}

export default connect((state: any) => ({
  project: state.projects.active,
}))(ProjectRouter);
