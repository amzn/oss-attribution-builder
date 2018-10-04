// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// tslint:disable:no-empty

import * as wordwrap from 'wordwrap';

// This tag notes that the license was pulled from SPDX sources.

export function validateSelf(name, text, tags) {}

export function validateUsage(pkg, usage) {}

export function transformLicense(original, packages) {
  let text = original;

  // SPDX BSD texts include a stub copyright line for some reason. remove those.
  // see the `all` tag for a general warning applied to these.
  text = text.replace(/^\s*Copyright.*<(year|owner)>.*[\r\n]*/i, '');

  return wordwrap(80)(text);
}
