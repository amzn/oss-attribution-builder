// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { WebPackage } from '../../../../server/api/v1/packages/interfaces';
import { fetchPackage, PackageSet } from '../../../modules/packages';
import { triggerOnVisible } from '../../../util/viewport';
import PackageCardUsage, { Props as UsageProps } from './PackageCardUsage';
import PackageVerificationMark from './PackageVerificationMark';

interface Props {
  dispatch: (action: any) => any;
  packageId: number;
  packages: PackageSet;
  usage?: UsageProps;
  buttons?: any[];
  preStyle?: React.CSSProperties;
}

class PackageCard extends Component<Props, {}> {
  private ref?: HTMLElement;
  extendedFetched: boolean = false;

  static defaultProps = {
    packages: {},
    preStyle: { overflow: 'auto', maxHeight: '150px' },
  };

  componentWillMount() {
    const { dispatch, packageId } = this.props;
    dispatch(fetchPackage(packageId));
  }

  componentDidMount() {
    triggerOnVisible(this.ref!, () => {
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
  };

  render() {
    const { packageId, packages, usage, buttons, preStyle } = this.props;
    const pkg = packages[packageId] || ({} as WebPackage);

    return (
      <div
        className="card package-card mb-2"
        ref={r => {
          if (r) {
            this.ref = r;
          }
        }}
      >
        <div className="card-body">
          <div className="float-right">
            <div className="btn-toolbar">
              <div className="btn-group btn-group-sm">
                <a className="btn btn-link" href={pkg.website} target="_blank">
                  Website
                </a>
              </div>

              <div className="btn-group btn-group-sm">{buttons}</div>
            </div>
          </div>

          <h4>
            <PackageVerificationMark pkg={pkg} /> {pkg.name}{' '}
            <small>
              <span title={`id ${pkg.packageId}`}>{pkg.version} </span>
              <span className="badge badge-info">{pkg.license}</span>
            </small>
          </h4>

          {this.props.children}

          {usage != undefined && <PackageCardUsage {...usage} />}
        </div>

        <div className="card-footer">
          <pre style={preStyle}>{pkg.copyright}</pre>

          {pkg.licenseText != undefined &&
            pkg.licenseText !== '' && (
              <pre style={preStyle}>{pkg.licenseText}</pre>
            )}
        </div>
      </div>
    );
  }
}

export default connect((state: any) => ({
  packages: state.packages.set,
}))(PackageCard);
