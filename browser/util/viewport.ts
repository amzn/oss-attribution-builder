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

import debounce from './debounce';

export function inViewport(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return (
    r.bottom > 0 && r.top < window.innerHeight &&
    r.right > 0 && r.left < window.innerWidth
  );
}

/**
 * Fire a function when the given element is visible on the page.
 *
 * Detatches the event listener afterwards.
 */
export function triggerOnVisible(el: HTMLElement, fn: () => void) {
  if (inViewport(el)) {
    fn();
    return;
  }

  const listener = debounce(() => {
    if (inViewport(el)) {
      window.removeEventListener('scroll', listener);
      fn();
    }
  }, 200);
  window.addEventListener('scroll', listener);
}
