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

import 'core-js/shim';

import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';

import App from './components/App';
import Landing from './components/Landing';
import PackageVerification from './components/projects/admin/PackageVerification';
import PackageVerificationQueue from './components/projects/admin/PackageVerificationQueue';
import Projects from './components/projects/browse/Projects';
import Onboarding from './components/projects/editor/Onboarding';
import ProjectView from './components/projects/editor/ProjectView';
import AttributionDocBuilder from './components/projects/render/AttributionDocBuilder';
import store from './store';

// routes listed here should point to redux-enabled containers
window.addEventListener('DOMContentLoaded', () => {
  render(
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={Landing} />
          <Route path="projects" component={Projects} />
          <Route path="projects/new" component={Onboarding} />
          <Route path="projects/:projectId" component={ProjectView} />
          <Route path="projects/:projectId/build" component={AttributionDocBuilder} />
          <Route path="packages/verify" component={PackageVerificationQueue} />
          <Route path="packages/verify/:packageId" component={PackageVerification} />
        </Route>
      </Router>
    </Provider>,
    document.getElementById('content'),
  );
});
