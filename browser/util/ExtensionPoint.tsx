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

import * as React from 'react';

import { getExtensions } from '../ext';

interface Props {
  ext: string;
  children?: any;
  [p: string]: any;
}

// `any` needed below; see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20356
const ExtensionPoint: React.SFC<Props> = (props): any => {
  const exts = getExtensions(props.ext);
  if (exts.length === 0) {
    // tslint:disable-next-line:no-null-keyword
    return props.children || null;
  }

  return exts.map((Ext, i) => <Ext key={`ext-${props.ext}-${i}`} {...props} />);
};

export default ExtensionPoint;
