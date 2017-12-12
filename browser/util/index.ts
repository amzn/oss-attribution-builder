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

import 'whatwg-fetch';

import { ADMIN_SESSION_KEY } from '../modules/common';

/**
 * Convenience function for sending/receiving JSON for API calls.
 */
export async function reqJSON(url: string, obj?: any, method: string = 'POST') {
  const body = obj != undefined ? JSON.stringify(obj) : undefined;
  const response = await fetchAuth(url, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  });
  return await response.json();
}

/**
 * A wrapper around fetch() to inject an authorization token.
 *
 * Will throw on non 2xx responses.
 */
export async function fetchAuth(url: string, options?: any) {
  options = options || {};
  const headers = options.headers || {};

  // add admin header if enabled in store
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
    headers['X-Admin'] = '1';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (response.ok) {
    return response;
  } else {
    let error;

    // try to parse as json
    try {
      const json = await response.json();
      error = new Error(json.error);
    } catch (ex) {
      // otherwise just use the HTTP status code
      error = new Error(response.statusText);
    }

    error.code = response.status;
    error.response = response;
    throw error;
  }
}
