// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import * as ProjectActions from '../../../modules/projects';
import ProjectList from './ProjectList';

interface Props {
  dispatch: (action: any) => any;
  location?: any;
  projects: any[];
}

class Projects extends Component<Props, {}> {
  componentWillMount() {
    const { dispatch, location } = this.props;
    dispatch(ProjectActions.fetchProjects(location.search));
  }

  componentWillUpdate(nextProps) {
    const { dispatch, location } = this.props;
    if (location.search === nextProps.location.search) {
      return;
    }

    dispatch(ProjectActions.fetchProjects(nextProps.location.search));
  }

  render() {
    const { projects } = this.props;
    return <ProjectList projects={projects} />;
  }
}

export default connect((state: any) => {
  return {
    projects: state.projects.list,
  };
})(Projects);
