// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
          {queue.map(pkg => (
            <tr key={pkg.packageId}>
              <td>
                <Link to={`/packages/verify/${pkg.packageId}`}>
                  {pkg.name} {pkg.version}
                </Link>
              </td>
              <td>
                {pkg.extra!.stats!.numProjects} project
                {pkg.extra!.stats!.numProjects !== 1 && 's'}
              </td>
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
