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
import { Component } from 'react';

import { WebPackage } from '../../../../server/api/packages/interfaces';

interface Props {
  pkg: WebPackage;
}

// There's a small chance the tooltip will get stuck saying "loading"
// due to the fact that popovers/tooltips are basically fixed once
// created. The logic in componentDidUpdate basically recreates it
// for every update, but it won't update the active popover.
// I know this logic sucks, but bootstrap just doesn't play very well
// with things that need to dynamically update.

export default class PackageVerificationMark extends Component<Props, {}> {
  self = null;

  componentDidMount() {
    $(this.self).tooltip();
  }

  componentDidUpdate() {
    $(this.self).find('[data-toggle="popover"]').popover({placement: 'bottom', container: 'body', trigger: 'click'});
  }

  renderInner = () => {
    const { pkg } = this.props;

    // don't render if we don't have everything loaded
    if (pkg == null || pkg.verified == null || pkg.extra == null) {
      return <span ref={(r) => this.self = r} />;
    }

    let content = 'Loading details...';
    const extra = pkg.extra.verification;
    if (extra) {
      content = `Reviewed by ${extra.verifiedBy}.`;
      if (extra.comments.length > 0) {
        content += '\n\nComments: ' + extra.comments;
      }
    }

    if (pkg.verified) {
      return (
        <span className="badge badge-success"
          data-toggle="popover"
          data-title="Package info verified as correct"
          data-content={content}
          >
          <i className="fa fa-star" />
        </span>
      );
    } else {
      return (
        <span className="badge badge-danger"
          data-toggle="popover"
          data-title="Package info marked incorrect"
          data-content={content}
          >
          <i className="fa fa-thumbs-o-down" />
        </span>
     );
    }
  }

  render() {
    return (
      <span ref={(r) => this.self = r} style={{cursor: 'pointer'}}
        data-toggle="tooltip"
        data-placement="right"
        title="Click for details"
        className="mr-2"
        >
        {this.renderInner()}
      </span>
    );
  }

}
