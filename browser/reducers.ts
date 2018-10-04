// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { combineReducers } from 'redux';

import commonReducer from './modules/common';
import licenseReducer from './modules/licenses';
import packageReducer from './modules/packages';
import projectReducer from './modules/projects';

export default combineReducers({
  common: commonReducer,
  licenses: licenseReducer,
  packages: packageReducer,
  projects: projectReducer,
});
