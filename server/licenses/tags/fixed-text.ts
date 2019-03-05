// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function validateSelf(name, text, tags) {
  if (tags.includes('user-supplied')) {
    return [
      {
        level: 0,
        message:
          `The ${name} license's text is standardized -- ` +
          'if the text is actually different, you may have a different license.',
      },
    ];
  }
}

export const presentation = {
  fixedText: true,
  longText: "This license text is standardized; you don't need to paste it in.",
};
