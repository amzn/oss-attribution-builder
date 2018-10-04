// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import 'core-js/shim';

import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';

import App from './components/App';
import history from './history';
import store from './store';

// routes listed here should point to redux-enabled containers
window.addEventListener('DOMContentLoaded', () => {
  // see components/App.tsx for the rest of the routes
  render(
    <Provider store={store}>
      <Router history={history}>
        <Route component={App} />
      </Router>
    </Provider>,
    document.getElementById('content')
  );
});

// @ts-ignore
// load up extensions (webpack hook)
const extCtx = require.context('./extensions', false, /.ext.[jt]sx?$/);
extCtx.keys().forEach(extCtx);
