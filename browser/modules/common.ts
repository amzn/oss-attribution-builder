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

import { getClaims, getToken } from '../util/auth';

export const SET_GENERAL_ERROR = 'app/common/set-general-error';
export const RECEIVE_USER_DATA = 'app/common/receive-user-data';

const initial = {
  generalError: null as string,
  claims: null as any,
};

export default function reducer(state = initial, action: any = {}) {
  switch (action.type) {
    case SET_GENERAL_ERROR:
      return Object.assign({}, state, {
        generalError: action.message,
      });

    case RECEIVE_USER_DATA:
      return Object.assign({}, state, {
        claims: action.claims,
      });

    default:
      return state;
  }
}

export function setGeneralError(error: {message: string} | string) {
  if (typeof error === 'string') {
    error = {message: error};
  }

  return {
    type: SET_GENERAL_ERROR,
    message: error,
  };
}

export function receiveUserData(claims: any) {
  claims.groups.sort();
  return {
    type: RECEIVE_USER_DATA,
    claims,
  };
}

export function fetchUserData(query?: any) {
  return async (dispatch: any) => {
    await getToken(query);
    const claims = getClaims();
    dispatch(receiveUserData(claims));
  };
}
