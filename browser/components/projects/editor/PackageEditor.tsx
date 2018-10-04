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

import { WebTag } from '../../../../server/api/licenses/interfaces';
import {
  PackageUsage,
  WebProject,
} from '../../../../server/api/projects/interfaces';
import * as ProjectActions from '../../../modules/projects';
import ExtensionPoint from '../../../util/ExtensionPoint';
import PackageFields, { PkgOutput } from './PackageFields';
import UsageFields from './UsageFields';

interface OwnProps {
  initialPackage?: PkgOutput;
  initialUsage?: Partial<PackageUsage>;
  onCompleted: () => any;
}

interface Props extends OwnProps {
  dispatch: (action: any) => any;
  project: WebProject;
  licenses: Map<string, any>;
  tags: { [key: string]: WebTag };
}

interface State {
  pkg: PkgOutput;
  usage: Partial<PackageUsage>;
}

/**
 * A form used to attach (optionally create) a package to a project.
 */
class PackageEditor extends Component<Props, Partial<State>> {
  static defaultProps = {
    initialPackage: undefined,
    initialUsage: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      pkg: props.initialPackage,
      usage: props.initialUsage,
    };
  }

  handleSubmit = async e => {
    e.preventDefault();

    // do nothing if no package entered
    if (this.state.pkg == undefined) {
      return;
    }

    const {
      dispatch,
      onCompleted,
      project: { projectId },
    } = this.props;
    const {
      pkg: {
        packageId,
        name,
        version,
        website,
        copyright,
        license,
        licenseText,
      },
      usage,
    } = this.state;

    await dispatch(
      ProjectActions.attachPackageToProject(projectId, {
        packageId,
        name,
        version,
        website,
        copyright,
        license,
        licenseText,
        usage,
      })
    );

    window.sessionStorage.setItem('package_help_shown', '1');
    onCompleted();
  };

  handlePkgChanged = pkg => {
    this.setState({ pkg });
  };

  handleUsageChanged = usage => {
    this.setState({ usage });
  };

  render() {
    const {
      initialPackage,
      initialUsage,
      licenses,
      project,
      tags,
    } = this.props;
    const { pkg, usage } = this.state;

    // XXX: move this out of the render path?
    // collect questions from tags
    let questions = {};
    const license = pkg && pkg.license && licenses.get(pkg.license);
    if (license) {
      questions = license.tags.map(name => tags[name].questions || {}).reduce(
        (acc, curr) => ({
          ...acc,
          ...curr,
        }),
        {}
      );
    } else {
      // default questions via the "unknown" tag
      questions = (tags.unknown && tags.unknown.questions) || {};
    }

    return (
      <form
        id="add-package-form"
        className="form mt-4"
        onSubmit={this.handleSubmit}
      >
        {this.renderPackageHelp()}

        <h4>
          Package Details{' '}
          {initialPackage && (
            <span className="badge badge-warning">
              Editing <strong>{initialPackage.name}</strong>
            </span>
          )}
        </h4>
        <PackageFields
          initial={initialPackage}
          onChange={this.handlePkgChanged}
        />

        {pkg && (
          <div>
            <h4>
              Usage details{' '}
              <small className="text-muted">In your project</small>
            </h4>
            <UsageFields
              initial={initialUsage}
              questions={questions}
              onChange={this.handleUsageChanged}
            />
          </div>
        )}

        <ExtensionPoint
          ext="package-editor-end"
          project={project}
          pkg={pkg}
          usage={usage}
          license={license}
          questions={questions}
        />

        <button type="submit" className="btn btn-primary">
          {initialPackage ? (
            <span>
              <i className="fa fa-floppy-o" /> Save Changes
            </span>
          ) : (
            <span>
              <i className="fa fa-plus" /> Add
            </span>
          )}
        </button>
      </form>
    );
  }

  renderPackageHelp() {
    // only show once per session
    if (window.sessionStorage.getItem('package_help_shown') != undefined) {
      return;
    }

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-heading">
                How to identify licenses and copyrights
              </h5>
              <div className="card-text">
                <small>(This message is only shown once per session.)</small>

                <p style={{ textAlign: 'center' }}>
                  <img
                    src="/assets/images/copyright-vs-license.png"
                    className="img-rounded"
                    alt="Copyright/license example"
                    style={{ width: '100%', maxWidth: '700px' }}
                  />
                </p>
                <p>
                  Note that projects may do things differently. A copyright
                  statement may not always be in these files; it may be present
                  in the headers of the source code instead. Sometimes it is
                  present in the README.
                </p>
                <p>
                  If the package you're using has a NOTICE file, it often
                  includes a copyright statement. You can include the NOTICE
                  file in same box below.
                </p>

                <h5>Identifying a License</h5>

                <p>
                  Licenses often state their name towards the top of the license
                  text. Some licenses don't; these are frequently MIT or BSD
                  variants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state: any, props: OwnProps) => ({
  project: state.projects.active,
  licenses: state.licenses.map,
  tags: state.licenses.tags,
}))(PackageEditor);
