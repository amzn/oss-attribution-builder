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

import { WebPackage } from '../../../../server/api/packages/interfaces';
import { fetchPackage, PackageSet } from '../../../modules/packages';
import { triggerOnVisible } from '../../../util/viewport';
import PackageCardUsage, { Props as UsageProps } from './PackageCardUsage';
import PackageVerificationMark from './PackageVerificationMark';

interface Props {
  dispatch: any;
  packageId: number;
  packages: PackageSet;
  usage?: UsageProps;
  buttons: any[];
  preStyle?: React.CSSProperties;
}

class PackageCard extends Component<Props, {}> {
  ref: HTMLElement;
  extendedFetched: boolean = false;

  static defaultProps = {
    packages: {},
    preStyle: {overflow: 'auto', maxHeight: '150px'},
  };

  componentWillMount() {
    const { dispatch, packageId } = this.props;
    dispatch(fetchPackage(packageId));
  }

  componentDidMount() {
    triggerOnVisible(this.ref, () => {
      this.fetchExtended();
    });
  }

  componentWillUpdate(nextProps) {
    const { dispatch, packageId } = this.props;
    if (nextProps.packageId === packageId) {
      return;
    }

    dispatch(fetchPackage(nextProps.packageId));
  }

  fetchExtended = () => {
    const { dispatch, packageId, packages } = this.props;
    if (packages[packageId] && this.extendedFetched) {
      return;
    }
    this.extendedFetched = true;
    dispatch(fetchPackage(packageId, true));
  }

  render() {
    const { packageId, packages, usage, buttons, preStyle } = this.props;
    const pkg = packages[packageId] || {} as WebPackage;

    return (
      <div className="card package-card mb-2" ref={(r) => this.ref = r}>
        <div className="card-block">

          <div className="float-right">

            <div className="btn-toolbar">
              <div className="btn-group btn-group-sm">
                <a className="btn btn-default btn-link" href={pkg.website} target="_blank">Website</a>
              </div>

              <div className="btn-group btn-group-sm">
                {buttons}
              </div>
            </div>
          </div>

          <h4>
            <PackageVerificationMark pkg={pkg} />{' '}
            {pkg.name}{' '}
            <small>
              {pkg.version}{' '}
              <span className="badge badge-info">{pkg.license}</span>
            </small>
          </h4>

          {this.props.children}

          { usage != null && <PackageCardUsage {...usage} /> }
        </div>

        <div className="card-footer">
          <pre style={preStyle}>
            {pkg.copyright}
          </pre>

          {pkg.licenseText != null && pkg.licenseText !== '' && (
            <pre style={preStyle}>
              {pkg.licenseText}
            </pre>
          )}
        </div>

      </div>
    );
  }

}

export default connect((state) => ({
  packages: state.packages.set,
}))(PackageCard) as React.ComponentClass<Partial<Props>>;
