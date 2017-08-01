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
import ProjectOnboardingForm from './ProjectOnboardingForm';

interface Props {
  dispatch: any;
  claims?: any;
}

class Onboarding extends Component<Props, {}> {

  render() {
    const { dispatch, claims } = this.props;
    return (
      <div>
        <h2>Tell us about your project</h2>
        <ProjectOnboardingForm
          createProject={(details) => dispatch(ProjectActions.createProject(details))}
          groups={claims != null ? claims.groups : []}
        />
      </div>
    );
  }

}

export default connect((state) => state.common)(Onboarding);
