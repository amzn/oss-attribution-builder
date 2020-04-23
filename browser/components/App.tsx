// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
import Modal from './util/Modal';
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

  dismissError = (actionName) => {
    const { dispatch } = this.props;
    dispatch(setGeneralError(undefined));
  };

  mapError(err) {
    let title = '';
    let explain = '';

    switch (err.code) {
      case 403:
        title = 'You might not have access to this resource';
        explain =
          'If you think you need access to this item, contact the site administrator.';
        break;

      default:
        title = 'Something went wrong';
        explain = 'Please try that again.';
        break;
    }

    return (
      <Modal title={title} onDismiss={this.dismissError}>
        {(buttonAction) => (
          <>
            <div className="modal-body">
              <p>
                There was a problem:
                <br />
                <strong>{err.message}</strong>
              </p>
              <p>{explain}</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={buttonAction('close')}
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
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
