// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { applyMiddleware, createStore } from 'redux';

import { setGeneralError } from './modules/common';
import app from './reducers';

// capture and show errors on the UI for server actions
const errorHandler = inst => next => action => {
  const result = next(action);

  // is this a thunk/promise action?
  if (typeof action === 'function') {
    // check the promise for an error, and dispatch that
    result.catch(error => {
      inst.dispatch(setGeneralError(error));
      throw error;
    });
  }
  return result;
};

// enable thunk/promise actions
const thunk = inst => next => action => {
  if (typeof action === 'function') {
    return action(inst.dispatch, inst.getState);
  }
  return next(action);
};

const createStoreWithMiddleware = applyMiddleware(errorHandler, thunk)(
  createStore
);

const store = createStoreWithMiddleware(app);

export default store;
