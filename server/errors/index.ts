// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Authz error for valid tokens, but no access to a resource.
 */
export class AccessError extends Error {
  status: number;

  constructor(message: string) {
    super();
    this.name = 'AccessError';
    this.message = message;
    this.status = 403;
  }
}

/**
 * Invalid request.
 */
export class RequestError extends Error {
  status: number;

  constructor(message: string) {
    super();
    this.name = 'RequestError';
    this.message = message;
    this.status = 400;
  }
}
