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

/**
 * Retrieve the stored JWT, authenticating if necessary.
 */
export async function getToken(query?: string) {
  // a query string will force a new token
  if (query != null) {
    return await authenticate(query);
  }

  // grab the stored token or authenticate
  let stored: any = window.sessionStorage.getItem('auth_token');
  if (stored == null) {
    return await authenticate();
  }
  stored = JSON.parse(stored);

  // renew if it's old
  const renewAt = new Date(stored.renew);
  if (new Date() > renewAt) {
    return await authenticate();
  }

  return stored.token;
}

/**
 * Retrieve the signed/stored claims (user, groups).
 *
 * Must be called after getToken.
 */
export function getClaims() {
  return JSON.parse(window.sessionStorage.getItem('auth_claims'));
}

function storeAuth(token: string, renewInSeconds: number, claims: any) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + renewInSeconds);
  window.sessionStorage.setItem('auth_token', JSON.stringify({token, renew: date.toJSON()}));
  window.sessionStorage.setItem('auth_claims', JSON.stringify(claims));
}

async function authenticate(query?: string) {
  let url = '/auth';
  if (query != null) {
    url = `${url}?${query}`;
  }

  // pass along cookies for SSO interceptors
  const response = await fetch(url, {credentials: 'same-origin'});
  const json = await response.json();
  const token = json.token;
  storeAuth(token, json.renewInSeconds, json.claims);
  return token;
}
