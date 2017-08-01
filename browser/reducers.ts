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

import { combineReducers } from 'redux';

import commonReducer from './modules/common';
import licenseTextReducer from './modules/license-texts';
import licenseReducer from './modules/licenses';
import packageReducer from './modules/packages';
import projectReducer from './modules/projects';

export default combineReducers({
  common: commonReducer,
  licenseTexts: licenseTextReducer,
  licenses: licenseReducer,
  packages: packageReducer,
  projects: projectReducer,
});
