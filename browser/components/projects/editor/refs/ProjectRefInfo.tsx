// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { WebProject } from '../../../../../server/api/projects/interfaces';
import * as ProjectActions from '../../../../modules/projects';

interface OwnProps {}

interface Props extends OwnProps {
  project: WebProject & { refInfo: any };
  dispatch: (action: any) => any;
}

class ProjectRefInfo extends React.Component<Props, {}> {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const { dispatch, project } = this.props;

    await dispatch(ProjectActions.getRefInfo(project.projectId));
  }

  render() {
    const { project } = this.props;

    if (project == undefined || project.refInfo == undefined) {
      return <small className="text-muted">Loading</small>;
    }

    return Object.keys(project.refs).map(targetProjectId =>
      this.renderRef(targetProjectId)
    );
  }

  renderRef(targetProjectId) {
    const { project } = this.props;

    const targetProject = project.refInfo.refs[targetProjectId];
    const ref = project.refs[targetProjectId];

    // not yet loaded
    if (targetProject == undefined) {
      return (
        <div key={targetProjectId}>
          Project <Link to={`./${targetProjectId}`}>#{targetProjectId}</Link> (
          {ref.type})
        </div>
      );
    }

    return (
      <div key={targetProjectId}>
        Project{' '}
        <Link to={`./${targetProjectId}`}>
          "{targetProject.title}" version {targetProject.version}
        </Link>{' '}
        ({ref.type})
      </div>
    );
  }
}

export default connect((state: any, props: OwnProps) => ({
  project: state.projects.active,
}))(ProjectRefInfo);
