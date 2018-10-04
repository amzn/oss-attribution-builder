// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// indicates that software using this license generally has a NOTICE file
// these notices will be rendered under the license text.
// largely Apache-2.0 specific.

// tslint:disable:no-empty

export function validateSelf(name, text, tags) {}

export function validateUsage(pkg, usage) {}

// we strip out the original copyright text up top
export function transformCopyright(original) {
  return '';
}

// ...and place it at the bottom
export function transformLicense(original, packages) {
  const notices: string[] = [];
  for (const pkgBundle of packages) {
    const { pkg } = pkgBundle;

    const indented = pkg.copyright.replace(/^|\n/g, '\n    ');
    const notice = `* For ${
      pkg.name
    } see also this required NOTICE:${indented}`;

    notices.push(notice);
  }

  const noticeText = notices.join('\n');
  return `${original}\n\n${noticeText}`;
}
