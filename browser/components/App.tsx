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
import { NavLink, Route, Switch } from 'react-router-dom';

import {
  fetchSiteInfo,
  setAdminMode,
  setGeneralError,
} from '../modules/common';
import ExtensionPoint from '../util/ExtensionPoint';
import Landing from './Landing';
import NotFound from './NotFound';
import PackageVerification from './projects/admin/PackageVerification';
import PackageVerificationQueue from './projects/admin/PackageVerificationQueue';
import Projects from './projects/browse/Projects';
import ProjectOnboardingForm from './projects/editor/ProjectOnboardingForm';
import ProjectRouter from './projects/ProjectRouter';
import ErrorModal from './util/ErrorModal';
import ToggleLink from './util/ToggleLink';

interface Props {
  dispatch: (action: any) => any;
  generalError: any;
  canAdmin: boolean;
  admin: boolean;
}

class App extends React.Component<Props, {}> {
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(fetchSiteInfo());
  }

  dismissError = () => {
    const { dispatch } = this.props;
    dispatch(setGeneralError(undefined));
  };

  mapError(err) {
    if (err.code === 403) {
      return (
        <ErrorModal
          message={err.message}
          onDismiss={this.dismissError}
          title="You might not have access to this resource"
          explain="If you think you need access to this item, contact the site administrator."
        />
      );
    }

    return (
      <ErrorModal
        message={err.message}
        onDismiss={this.dismissError}
        title="Something went wrong"
        explain="Please try that again."
      />
    );
  }

  toggleAdmin = () => {
    const { dispatch, admin } = this.props;
    dispatch(setAdminMode(!admin));
  };

  render() {
    const { generalError, canAdmin, admin } = this.props;
    return (
      <>
        <ExtensionPoint ext="page-start" />

        <nav className="navbar navbar-expand-sm navbar-light bg-light">
          <NavLink
            exact={true}
            to="/"
            className="navbar-brand"
            activeClassName="active"
          >
            <ExtensionPoint ext="navbar-logo">
              Attribution Builder
            </ExtensionPoint>
          </NavLink>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavLink
                  exact={true}
                  to="/projects/"
                  className="nav-link"
                  activeClassName="active"
                >
                  My Projects
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  exact={true}
                  to="/projects/new"
                  className="nav-link"
                  activeClassName="active"
                >
                  New Project
                </NavLink>
              </li>
            </ul>
            <ExtensionPoint ext="navbar-end" />
          </div>
        </nav>

        {generalError != undefined && this.mapError(generalError)}

        <div className="container mt-4">
          <div className="row">
            <div className="mx-auto col-lg-10">
              <Switch>
                <Route exact={true} path="/" component={Landing} />
                <Route exact={true} path="/projects" component={Projects} />
                <Route
                  exact={true}
                  path="/projects/new"
                  component={ProjectOnboardingForm}
                />
                <Route path="/projects/:projectId" component={ProjectRouter} />
                <Route
                  exact={true}
                  path="/packages/verify"
                  component={PackageVerificationQueue}
                />
                <Route
                  path="/packages/verify/:packageId"
                  component={PackageVerification}
                />
                <Route component={NotFound} />
              </Switch>
            </div>
          </div>

          <div className="row mt-4">
            <div className="mx-auto col-lg-10">
              {canAdmin && (
                <div className="pull-right">
                  <ToggleLink state={admin} onClick={this.toggleAdmin}>
                    Admin
                  </ToggleLink>
                </div>
              )}
              <ExtensionPoint ext="footer" />
            </div>
          </div>
        </div>

        <ExtensionPoint ext="page-end" />
      </>
    );
  }
}

export default connect((state: any) => ({
  generalError: state.common.generalError,
  canAdmin:
    state.common.info.permissions && state.common.info.permissions.admin,
  admin: state.common.admin,
}))(App);
