// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const questions = {
  modified: {
    label: 'Modified',
    options: [
      [false, 'Unmodified'],
      [true, 'Changes made'],
    ],
    type: 'boolean',
    widget: 'radio',
    required: true,
  },
};
