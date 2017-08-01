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

import { getToken } from './auth';

/**
 * Convenience function for sending/receiving JSON for API calls.
 */
export function reqJSON(url: string, obj?: any, method: string = 'POST') {
  const body = obj != null ? JSON.stringify(obj) : undefined;
  return fetchAuth(url, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  }).then((response) => response.json());
}

/**
 * A wrapper around fetch() to inject an authorization token.
 *
 * Will throw on non 2xx responses.
 */
export async function fetchAuth(url: string, options?: any) {
  options = options || {};
  const headers = options.headers || {};
  const token = await getToken();
  headers.Authorization = `Bearer ${token}`;
  return fetch(url, {
    ...options,
    headers,
  }).then(async (response) => {
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
  });
}
