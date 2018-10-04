// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Meta-tag: this is applied to any license that doesn't match a "known"
// license (see the 'known' directory right next to this one)

// tslint:disable:no-empty no-var-requires

export function validateSelf(name, text, tags) {
  // less "confused" message for SPDX licenses
  if (tags.includes('spdx')) {
    return [
      {
        level: 1,
        message:
          `The attribution builder has the text of ${name}, ` +
          "but it doesn't have any additional instructions available. " +
          'Review this license carefully to ensure you comply with its terms.',
      },
    ];
  }

  const proper = name ? `${name}` : 'This license';
  return [
    {
      level: 1,
      message:
        `${proper} is not known by the attribution builder. ` +
        'Review it carefully to ensure you comply with its terms.',
    },
  ];
}

export function validateUsage(pkg, usage) {}

export const questions = {
  ...require('./linkage').questions,
  ...require('./modified').questions,
};
