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

import { fetchAuth } from '../util';

export const RECEIVE_LICENSE_TEXT = 'app/licenses/receive-license-text';
export const RECEIVE_CLA_TEXT = 'app/licenses/receive-cla-text';
export const RESET_SELECTED_LICENSE = 'app/licenses/reset-selected-license';

const initial = {
  license: '',
  text: '',
  inputFieldId: '',
};

export default function reducer(state = initial, action: any = {}) {
  switch (action.type) {
    case RECEIVE_LICENSE_TEXT:
      return Object.assign({}, state, {
        license: action.license,
        text: action.text,
        inputFieldId: action.inputFieldId,
      });

    case RECEIVE_CLA_TEXT:
      return Object.assign({}, state, {
        license: action.cla,
        text: action.text,
        inputFieldId: action.inputFieldId,
      });

    case RESET_SELECTED_LICENSE:
      return Object.assign({}, state, initial);

    default:
      return state;
  }
}

/*** Action creators ***/

export function receiveLicenseText(license, inputFieldId) {
  return {
    type: RECEIVE_LICENSE_TEXT,
    license: license.license,
    text: license.text,
    inputFieldId,
  };
}

export function receiveClaText(cla, inputFieldId) {
  return {
    type: RECEIVE_CLA_TEXT,
    cla: cla.cla,
    text: cla.text,
    inputFieldId,
  };
}

export function resetSelectedLicence() {
  return {
    type: RESET_SELECTED_LICENSE,
  };
}

/*** Bound action creators ***/

export function fetchLicenseText(license, inputFieldId) {
  return (dispatch) => {
    return fetchAuth('/api/licenses/texts/' + license)
      .then((response) => response.json())
      .then((json) => dispatch(receiveLicenseText(json, inputFieldId)));
  };
}

export function fetchClaText(cla, inputFieldId) {
  return (dispatch) => {
    return fetchAuth('/api/clas/texts/' + cla)
      .then((response) => response.json())
      .then((json) => dispatch(receiveClaText(json, inputFieldId)));
  };
}
