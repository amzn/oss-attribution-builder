// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React = require('react');
import { connect } from 'react-redux';

import { WebTag } from '../../../../server/api/v1/licenses/interfaces';
import { WebPackage } from '../../../../server/api/v1/packages/interfaces';
import { PackageUsage } from '../../../../server/api/v1/projects/interfaces';
import * as PackageActions from '../../../modules/packages';
import * as ProjectActions from '../../../modules/projects';
import PackageCard from '../packages/PackageCard';
import DetatchButton from './DetatchButton';

const DeltaFields: Array<[keyof WebPackage, string]> = [
  ['website', 'Website'],
  ['license', 'License'],
  ['licenseText', 'License text'],
  ['copyright', 'Copyright/NOTICE'],
];

interface OwnProps {
  usage: PackageUsage;
  onEditPackage: () => void;
}

interface Props extends OwnProps {
  dispatch: (action: any) => any;
  project: any;
  packages: PackageActions.PackageSet;
  tags: { [key: string]: WebTag };
}

interface State {
  showDelta: boolean;
}

class ProjectPackage extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      showDelta: false,
    };
  }

  detachPackage = () => {
    const { dispatch, project, usage } = this.props;
    dispatch(
      ProjectActions.detachPackageFromProject(
        project.projectId,
        usage.packageId
      )
    );
  };

  showDelta = (e) => {
    const { dispatch, packages, usage } = this.props;

    // at this point, we have the extra section already, so fetch the lastest revision
    const pkg = packages[usage.packageId];
    dispatch(PackageActions.fetchPackage(pkg.extra!.latest!));

    this.setState({ showDelta: true });
  };

  replacePackage = (newId: number) => {
    const { dispatch, project, usage } = this.props;
    dispatch(
      ProjectActions.replacePackageForProject(
        project.projectId,
        usage.packageId,
        newId
      )
    );
    this.setState({ showDelta: false });
  };

  render() {
    const { usage, packages, onEditPackage } = this.props;
    const { showDelta } = this.state;

    const buttons = [
      <button
        key={'edit'}
        className="btn btn-secondary package-edit-button"
        onClick={onEditPackage}
      >
        <i className="fa fa-pencil" />
      </button>,
      <DetatchButton
        key={'detach'}
        onClick={this.detachPackage}
        className="btn-secondary package-remove-button"
      />,
    ];

    // this "update" functionality isn't in PackageCard because it relates to usage
    // in this project, and isn't applicable to other package views

    // see if the we have newer metadata available
    const pkg = packages[usage.packageId];
    if (
      pkg != undefined &&
      pkg.extra != undefined &&
      pkg.extra.latest != undefined &&
      pkg.extra.latest !== usage.packageId
    ) {
      // add an update button
      buttons.unshift(
        <button
          key={'update'}
          className="btn btn-sm btn-info"
          onClick={this.showDelta}
        >
          <i className="fa fa-bolt" /> Update
        </button>
      );
    }

    // show a delta of the changes
    let child;
    if (showDelta) {
      child = <div className="alert alert-info">{this.renderDelta()}</div>;
    }

    return (
      <PackageCard packageId={usage.packageId} usage={usage} buttons={buttons}>
        {child}
      </PackageCard>
    );
  }

  renderDelta() {
    const { usage, packages } = this.props;
    const oldPkg = packages[usage.packageId];
    const newPkg = packages[oldPkg.extra!.latest!];

    if (newPkg == undefined) {
      return 'Loading updated metadata...';
    }

    const listElements: JSX.Element[] = [];
    for (const [field, label] of DeltaFields) {
      if (oldPkg[field] !== newPkg[field]) {
        listElements.push(
          <dt key={field}>{label}</dt>,
          <dd key={`${field}_v`} className="fixed-text">
            <div>{newPkg[field]}</div>
          </dd>
        );
      }
    }

    return (
      <div>
        <p>
          We have updated information available for{' '}
          <strong>
            {oldPkg.name} <em>{oldPkg.version}</em>
          </strong>
          . These changes include:
        </p>
        <dl>{listElements}</dl>
        <p>
          If this looks correct, you can apply these changes to your project:
        </p>
        <button
          className="btn btn-sm btn-success"
          onClick={() => this.replacePackage(newPkg.packageId)}
        >
          Accept changes
        </button>
      </div>
    );
  }
}

export default connect((state: any, props: OwnProps) => ({
  project: state.projects.active,
  packages: state.packages.set,
  tags: state.licenses.tags,
}))(ProjectPackage);
