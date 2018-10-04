// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import 'whatwg-fetch';

import { WebPackage } from '../../server/api/packages/interfaces';
import { fetchAuth, reqJSON } from '../util';

export const RECEIVE_PACKAGE = 'app/packages/receive-package';
export const RECEIVE_PACKAGE_SEARCH_RESULTS =
  'app/packages/reveive-package-search-results';
export const RECEIVE_PACKAGE_VERIFICATION_QUEUE =
  'app/packages/receive-package-verification-queue';

export interface PackageSet {
  [key: number]: WebPackage;
}

interface State {
  set: PackageSet;
  completions: WebPackage[];
  verificationQueue: Array<Partial<WebPackage>>;
}

const initial: State = {
  set: {},
  completions: [],
  verificationQueue: [],
};

export default function reducer(state = initial, action: any = {}): State {
  switch (action.type) {
    case RECEIVE_PACKAGE_SEARCH_RESULTS: {
      const newPackages = {};
      action.results.forEach(pkg => {
        newPackages[pkg.packageId] = pkg;
      });
      return {
        ...state,
        set: {
          ...state.set,
          ...newPackages,
        },
        completions: action.results,
      };
    }

    case RECEIVE_PACKAGE:
      return {
        ...state,
        set: {
          ...state.set,
          [action.package.packageId]: action.package,
        },
      };

    case RECEIVE_PACKAGE_VERIFICATION_QUEUE:
      return {
        ...state,
        verificationQueue: action.queue,
      };

    default:
      return state;
  }
}

/*** Action creators ***/

export function receivePackageSearchResults(results) {
  return {
    type: RECEIVE_PACKAGE_SEARCH_RESULTS,
    results: results.results,
  };
}

export function receivePackage(pkg) {
  return {
    type: RECEIVE_PACKAGE,
    package: pkg,
  };
}

export function receiveVerificationQueue(results) {
  return {
    type: RECEIVE_PACKAGE_VERIFICATION_QUEUE,
    queue: results.queue,
  };
}

/*** Bound action creators ***/

/**
 * Search packages.
 */
export function searchPackages(query) {
  return dispatch => {
    return reqJSON('/api/packages/', { query }).then(json =>
      dispatch(receivePackageSearchResults(json))
    );
  };
}

/**
 * Fetch a single package. Updates state & dispatches when complete.
 */
export function fetchPackage(packageId: number, extended = false) {
  const q = extended ? '?extended=1' : '';
  return dispatch => {
    return fetchAuth(`/api/packages/${packageId}${q}`)
      .then(response => response.json())
      .then(json => dispatch(receivePackage(json)));
  };
}

/**
 * Admin action: mark a package as "verified" (or incorrect), with comments.
 */
export function verifyPackage(
  packageId: number,
  verified: boolean,
  comments: string
) {
  return dispatch => {
    return reqJSON(`/api/packages/${packageId}/verify`, {
      verified,
      comments,
    }).then(json => dispatch(fetchPackage(packageId)));
  };
}

/**
 * Admin action: get the queue of packages that need verification love.
 */
export function fetchVerificationQueue() {
  return dispatch => {
    return reqJSON('/api/packages/verification', undefined, 'GET').then(json =>
      dispatch(receiveVerificationQueue(json))
    );
  };
}
