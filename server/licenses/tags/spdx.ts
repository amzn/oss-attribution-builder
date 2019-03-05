// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// This tag notes that the license was pulled from SPDX sources.

export function transformLicense(original, _packages) {
  let text = original;

  // SPDX BSD texts include a stub copyright line for some reason. remove those.
  // see the `all` tag for a general warning applied to these.
  text = text.replace(/^\s*Copyright.*<(year|owner)>.*[\r\n]*/i, '');

  return text;
}
