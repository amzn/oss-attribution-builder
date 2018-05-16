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

export interface TagModule {
  validateSelf: (
    name: string | undefined,
    text: string,
    tags: string[]
  ) => ValidationResult[];
  validateUsage: (pkg: any, usage: any) => ValidationResult[];
  transformCopyright?: (original: string) => string;
  transformLicense?: (original: string, packages) => string;
  presentation?: TagPresentation;
  questions?: TagQuestions;
}

export interface ValidationResult {
  level: 0 | 1 | 2;
  message: string;
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
 * A question to be asked when adding a package.
 *
 * Questions are added dynamically to the UI based on tags applied to a
 * selected license. For information on this behavior, see the README in the
 * tags directory.
 */
export interface TagQuestion {
  /**
   * A presentational label for this tag.
   */
  label: string;

  /**
   * Whether this question must be answered for the form to be submitted.
   */
  required: boolean;

  /**
   * The type of data this tag stores. Data will be coerced from form values.
   */
  type: 'string' | 'boolean' | 'number';

  /**
   * The form widget to use when displaying this question.
   *
   * 'radio' and 'select' values should be accompanied by an 'options' list;
   * see that field for info.
   */
  widget: 'radio' | 'text' | 'select';

  /**
   * If supplied, represents a list of valid options a user may choose from.
   *
   * Each element should be of the form `[value, label]` where 'value' is the
   * actual stored value and 'label' is the UI-friendly label.
   */
  options?: Array<[string | boolean | number, string]>;
}

export interface TagQuestions {
  [key: string]: TagQuestion;
}
