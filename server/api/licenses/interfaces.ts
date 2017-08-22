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

export interface WebLicense {
  name: string;
  tags: string[];
  presentation: LicensePresentation;
}

/**
 * Various flags a tag can set to influence the behavior of
 * the web UI. Used by modules; see LicensePresentation for what
 * actually gets sent to the browser.
 */
export interface TagPresentation {
  // should this license be shown first in the list? (alphabetically if competing with
  // other licenses with this flag)
  sortFirst?: boolean;
  // additional text to display in the drop-down list -- keep it really short! maybe use an emoji?
  shortText?: string;
  // text to display under the license box once selected. keep this reasonably short too!
  longText?: string;
  // if true, removes the "paste license text here" box. useful for licenses that never change,
  // e.g. GPL, Apache
  fixedText?: boolean;
}

/**
 * Like TagPresentation, but "collected" together for a single license.
 * Used in the UI.
 */
export interface LicensePresentation {
  sortFirst?: boolean;
  shortText?: string[];
  longText?: string[];
  fixedText?: boolean;
}
