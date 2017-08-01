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

import * as ProjectActions from '../../../modules/projects';
import ProjectList from './ProjectList';

interface Props {
  dispatch: any;
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
    return (
      <ProjectList projects={projects}/>
    );
  }

}

export default connect((state) => {
  return {
    projects: state.projects.list,
  };
})(Projects);
