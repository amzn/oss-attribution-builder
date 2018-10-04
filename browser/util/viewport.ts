// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import debounce from './debounce';

export function inViewport(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return (
    r.bottom > 0 &&
    r.top < window.innerHeight &&
    r.right > 0 &&
    r.left < window.innerWidth
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
