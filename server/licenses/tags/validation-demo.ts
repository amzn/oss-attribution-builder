// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const questions = {
  causeWarning: {
    label: 'Cause a warning for this package?',
    options: [
      [false, 'No'],
      [true, 'Yes'],
    ],
    type: 'boolean',
    widget: 'select',
    required: true,
  },
};

export function validateUsage(pkg, usage) {
  if (usage.causeWarning) {
    return [
      {
        level: 1,
        message: `This is a demo validation warning because you selected "Yes" to causing warnings on a package ("${pkg.name}") with MyCustomLicense (or another license with the "validation-demo" tag. Click it to highlight the package below!`,
      },
    ];
  }
  return [];
}
