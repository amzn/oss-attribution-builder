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

import { WebLicense } from '../../server/api/licenses/interfaces';
import { fetchAuth } from '../util';

export const RECEIVE_LICENSES = 'app/licenses/receive-licenses';
export const RECEIVE_CLAS = 'app/licenses/receive-clas';

interface State {
  list: WebLicense[];
  map: Map<string, WebLicense>;
}

const initial: State = {
  list: [],
  map: new Map(),
};

export default function reducer(state = initial, action: any = {}): State {
  switch (action.type) {
    case RECEIVE_LICENSES:
      return {
        ...state,
        list: action.licenses,
        map: action.licenses.reduce((map, curr) => {
          map.set(curr.name, curr);
          return map;
        }, state.map),
      };

    default:
      return state;
  }
}

/*** Action creators ***/

export function receiveLicenses(licenses) {
  return {
    type: RECEIVE_LICENSES,
    licenses,
  };
}

/*** Bound action creators ***/

export function fetchLicenses() {
  return (dispatch) => {
    return fetchAuth('/api/licenses/')
      .then((response) => response.json())
      .then((json) => dispatch(receiveLicenses(json)));
  };
}
