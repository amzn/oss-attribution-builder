import * as React from 'react';

import { register } from '../ext';

register('footer', (props) => {
  return (
    <div key="demo-footer-ext">
      <a href="https://github.com/amzn/oss-attribution-builder">
        oss-attribution-builder demo
      </a>
    </div>
  );
});
