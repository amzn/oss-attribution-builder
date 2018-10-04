// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
