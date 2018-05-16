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
