// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Force a download of a string as a text document.
 */
export function downloadText(filename: string, text: string) {
  // make a fake link
  const encoded = encodeURIComponent(text);
  const ele = document.createElement('a');
  ele.setAttribute('href', `data:text/plain;charset=utf-8,${encoded}`);
  ele.setAttribute('download', filename);
  ele.style.display = 'none';

  // add it to the page and click it, then remove it
  document.body.appendChild(ele);
  ele.click();
  document.body.removeChild(ele);
}
