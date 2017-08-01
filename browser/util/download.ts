/* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

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
