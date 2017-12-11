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
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { WebPackage } from '../../../../server/api/packages/interfaces';
import { fetchVerificationQueue } from '../../../modules/packages';

interface Props {
  dispatch: (action: any) => any;
  queue: Array<Partial<WebPackage>>;
}

class PackageVerificationQueue extends Component<Props, {}> {

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchVerificationQueue());
  }

  render() {
    const { queue } = this.props;

    return (
      <table className="table">
        <caption>Packages needing verification, in order of popularity</caption>
        <tbody>
          {queue.map((pkg) => (
            <tr key={pkg.packageId}>
              <td><Link to={`/packages/verify/${pkg.packageId}`}>{pkg.name} {pkg.version}</Link></td>
              <td>{pkg.extra!.stats!.numProjects} project{pkg.extra!.stats!.numProjects !== 1 && 's'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

}

export default connect((state: any) => ({
  queue: state.packages.verificationQueue,
}))(PackageVerificationQueue);
