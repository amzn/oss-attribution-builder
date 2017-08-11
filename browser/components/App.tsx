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
import { NavLink, Route, Switch } from 'react-router-dom';

import { fetchUserData, setGeneralError } from '../modules/common';
import Landing from './Landing';
import PackageVerification from './projects/admin/PackageVerification';
import PackageVerificationQueue from './projects/admin/PackageVerificationQueue';
import Projects from './projects/browse/Projects';
import Onboarding from './projects/editor/Onboarding';
import ProjectView from './projects/editor/ProjectView';
import AttributionDocBuilder from './projects/render/AttributionDocBuilder';
import ErrorModal from './util/ErrorModal';
import ToggleLink from './util/ToggleLink';

interface Props {
  dispatch: (action: any) => any;
  generalError?: any;
  claims: any;
}

class App extends Component<Props, {}> {
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(fetchUserData());
  }

  dismissError = () => {
    const { dispatch } = this.props;
    dispatch(setGeneralError(null));
  }

  mapError(err) {

    if (err.code === 403) {
      return (<ErrorModal
        message={err.message}
        onDismiss={this.dismissError}
        title="You might not have access to this resource"
        explain="If you think you need access to this item, contact the site administrator."
      />);
    }

    return (<ErrorModal
      message={err.message}
      onDismiss={this.dismissError}
      title="Something went wrong"
      explain="Please try that again."
    />);
  }

  toggleAdmin = () => {
    const { dispatch, claims } = this.props;
    const query = claims.admin ? 'admin=false' : 'admin=true';
    dispatch(fetchUserData(query));
  }

  render() {
    const { generalError, claims } = this.props;
    return (
      <div>
        <nav className="navbar navbar-expand-sm navbar-light bg-light">
          <NavLink exact to="/" className="navbar-brand" activeClassName="active">
            Attribution Builder
          </NavLink>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavLink exact to="/projects/" className="nav-link" activeClassName="active">My Projects</NavLink>
              </li>
              <li className="nav-item">
                <NavLink exact to="/projects/new" className="nav-link" activeClassName="active">New Project</NavLink>
              </li>
            </ul>
          </div>
        </nav>

        { generalError != null && this.mapError(generalError) }

        <div className="container mt-4">
          <div className="row">
            <div className="mx-auto col-lg-10">
              <Switch>
                <Route exact path="/" component={Landing} />
                <Route exact path="/projects" component={Projects} />
                <Route exact path="/projects/new" component={Onboarding} />
                <Route exact path="/projects/:projectId" component={ProjectView} />
                <Route exact path="/projects/:projectId/build" component={AttributionDocBuilder} />
                <Route exact path="/packages/verify" component={PackageVerificationQueue} />
                <Route exact path="/packages/verify/:packageId" component={PackageVerification} />
              </Switch>
            </div>
          </div>

          <div className="row mt-4">
            <div className="mx-auto col-lg-10">
              {claims && claims.admin != null ?
                <div className="pull-right">
                  <ToggleLink state={claims.admin} onClick={this.toggleAdmin}>Admin</ToggleLink>
                </div>
              : ''}
            </div>
          </div>
        </div>

      </div>

    );
  }

}

export default connect((state) => state.common)(App);
