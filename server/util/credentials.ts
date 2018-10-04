// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Calls the given function, storing the result (secret).
 * Returns a new function that can only be called once, providing the secret.
 */
export function selfDestruct(func) {
  let secret = func();

  return () => {
    if (secret == undefined) {
      throw new Error('Secret has been destroyed');
    }

    const copy = secret;
    secret = undefined;
    return copy;
  };
}
