// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { WebLicense, WebTag } from '../../server/api/v1/licenses/interfaces';
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
    return fetchAuth('/api/v1/licenses/')
      .then(response => response.json())
      .then(json => dispatch(receiveLicenses(json)));
  };
}
