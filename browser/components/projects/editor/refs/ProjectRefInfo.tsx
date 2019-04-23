// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { WebProject } from '../../../../../server/api/v1/projects/interfaces';
import * as ProjectActions from '../../../../modules/projects';
import DetatchButton from '../DetatchButton';
import { deleteRef } from '../../../../modules/projects';
import { DbProjectRef } from '../../../../../server/db/projects';

interface Props {
  project: WebProject & { refInfo: any };
  dispatch: (action: any) => any;
}

class ProjectRefInfo extends React.Component<Props, {}> {
  async componentDidMount() {
    const { dispatch, project } = this.props;

    await dispatch(ProjectActions.getRefInfo(project.projectId));
  }

  detatchProjectRef = (targetProjectId: string) => {
    const {
      dispatch,
      project: { projectId },
    } = this.props;
    dispatch(deleteRef(projectId, targetProjectId));
  };

  prettyRefType(type: DbProjectRef['type']) {
    switch (type) {
      case 'cloned_from':
        return 'cloned from';
      case 'related':
        return 'related to';
      case 'includes':
        return 'including packages from';
      default:
        break;
    }
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
          {ref.type} <Link to={`./${targetProjectId}`}>#{targetProjectId}</Link>
        </div>
      );
    }

    return (
      <div key={targetProjectId}>
        {this.prettyRefType(ref.type)}{' '}
        <Link to={`./${targetProjectId}`}>
          '{targetProject.title}' version {targetProject.version}
        </Link>
        {project.access.canEdit && (
          <>
            {' '}
            <DetatchButton
              className="btn-sm btn-link"
              onClick={() => this.detatchProjectRef(targetProjectId)}
            />
          </>
        )}
        {ref.comment && (
          <>
            <br />
            <small className="text-muted">{ref.comment}</small>
          </>
        )}
      </div>
    );
  }
}

export default connect((state: any) => ({
  project: state.projects.active,
}))(ProjectRefInfo);
