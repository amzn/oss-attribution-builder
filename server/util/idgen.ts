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

import { randomBytes } from 'crypto';

const alpha = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const size = alpha.length;

/**
 * Generate an ID of an arbitrary size.
 */
export default function generateID(length) {
  length = length || 1;
  let str = '';
  while (str.length < length) {
    str += generateShortID();
  }
  return str.slice(0, length);
}

/**
 * Generate a Flickr/Imgur/base58-style ID to discourage iteration of projects.
 */
function generateShortID() {
  // play it safe: generate a number significantly smaller than Number.MAX_SAFE_INTEGER
  let id = parseInt(randomBytes(4).toString('hex'), 16);
  let str = '';
  while (id > size) {
    const index = id % size;
    str += alpha[index];
    id = (id - index) / size;
  }
  return str;
}
