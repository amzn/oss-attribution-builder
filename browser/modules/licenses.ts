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

import { WebLicense, WebTag } from '../../server/api/licenses/interfaces';
import { fetchAuth } from '../util';

export const RECEIVE_LICENSES = 'app/licenses/receive-licenses';

interface State {
  list: WebLicense[];
  map: Map<string, WebLicense>;
  tags: { [key: string]: WebTag };
}

const initial: State = {
  list: [],
  map: new Map(),
  tags: {},
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
        tags: action.tags,
      };

    default:
      return state;
  }
}

/*** Action creators ***/

export function receiveLicenses(data) {
  return {
    type: RECEIVE_LICENSES,
    licenses: data.licenses,
    tags: data.tags,
  };
}

/*** Bound action creators ***/

export function fetchLicenses() {
  return dispatch => {
    return fetchAuth('/api/licenses/')
      .then(response => response.json())
      .then(json => dispatch(receiveLicenses(json)));
  };
}
