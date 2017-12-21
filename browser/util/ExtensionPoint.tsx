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
