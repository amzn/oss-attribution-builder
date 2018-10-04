// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// NOTE: this tag is referenced from the UI

// tslint:disable:no-empty

export function validateSelf(name, text, tags) {}

export function validateUsage(pkg, usage) {}

export const questions = {
  modified: {
    label: 'Modified',
    options: [[false, 'Unmodified'], [true, 'Changes made']],
    type: 'boolean',
    widget: 'radio',
    required: true,
  },
};
