// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { WebLicense } from '../../../../server/api/licenses/interfaces';
import {
  RefInfo,
  WebProject,
} from '../../../../server/api/projects/interfaces';
import * as PackageActions from '../../../modules/packages';
import * as ProjectActions from '../../../modules/projects';
import EditableText from '../../util/EditableText';
import PackageEditor from './PackageEditor';
import ProjectPackage from './ProjectPackage';
import AddRelatedProjectModal from './refs/AddRelatedProjectModal';
import ProjectRefInfo from './refs/ProjectRefInfo';

interface Props {
  dispatch: (action: any) => any;
  project: WebProject & { refInfo: any };
  packages: PackageActions.PackageSet;
  licenses: WebLicense[];
  projectRefs: { [id: string]: RefInfo };
}

interface State {
  editPackageId?: number;
  showPackageEditor: boolean;
  showAddRelatedProjectModal: boolean;
}

class ProjectView extends Component<Props, State> {
  state = {
    editPackageId: undefined,
    showPackageEditor: false,
    showAddRelatedProjectModal: false,
  };

  getOwners() {
    const {
      project: { acl },
    } = this.props;
    const owners: string[] = [];
    for (const user of Object.keys(acl)) {
      const access = acl[user];
      if (access === 'owner') {
        owners.push(user);
      }
    }
    return owners.join(', ');
  }

  makeChangeEvent = (fieldName: string, bool?: boolean, extended?: string) => {
    const { dispatch, project } = this.props;
    return value => {
      if (bool) {
        value = value === 'true';
      }

      if (fieldName === 'contacts') {
        if (extended == undefined) {
          throw new Error('contacts extended data must not be undefined');
        }

        // transform a single contact field into a change of the contacts map
        // note that this is only capable of supporting a single contact of
        // each type, but this could easily be changed
        dispatch(
          ProjectActions.patchProject(project.projectId, {
            contacts: {
              ...project.contacts,
              [extended]: [value],
            },
          })
        );
      } else if (fieldName === 'meta') {
        if (extended == undefined) {
          throw new Error('meta extended data must not be undefined');
        }

        // transform a single meta edit into an updated meta map
        dispatch(
          ProjectActions.patchProject(project.projectId, {
            metadata: {
              ...project.metadata,
              [extended]: value,
            },
          })
        );
      } else {
        // everything else
        dispatch(
          ProjectActions.patchProject(project.projectId, {
            [fieldName]: value,
          })
        );
      }
    };
  };

  addRelatedProject = (e: React.MouseEvent<any>) => {
    e.preventDefault();

    this.setState({ showAddRelatedProjectModal: true });
  };

  hideRelatedProjectModal = () => {
    this.setState({ showAddRelatedProjectModal: false });
  };

  getPackageCount = () => {
    const { project } = this.props;
    const refLength = Object.entries(project.refs)
      .filter(([id, ref]) => ref.type === 'includes')
      .reduce((acc, [id, ref]) => {
        if (project.refInfo == undefined) {
          return 0;
        }
        const info = project.refInfo.refs[id];
        const add = info == undefined ? 0 : info.packageIds.length;
        return acc + add;
      }, 0);
    return project.packagesUsed.length + refLength;
  };

  render() {
    const { project } = this.props;
    const { showPackageEditor } = this.state;

    return (
      <>
        <div className="row">
          <div className="col-sm-9">
            <h2 id="project-heading">
              <EditableText
                value={project.title}
                enabled={project.access.canEdit}
                onChange={this.makeChangeEvent('title')}
              >
                {project.title}
              </EditableText>{' '}
              <small id="project-version">
                <EditableText
                  value={project.version}
                  enabled={project.access.canEdit}
                  onChange={this.makeChangeEvent('version')}
                >
                  version {project.version}
                </EditableText>
              </small>
            </h2>

            <p>
              <small>
                Created{' '}
                <strong title={project.createdOn.format()}>
                  {project.createdOn.fromNow()}
                </strong>
              </small>
              .
            </p>
          </div>

          <div className="col-sm-3">{this.renderTools()}</div>
        </div>

        <div className="row">
          <div className="col-12">
            <p className="lead" id="project-description">
              <EditableText
                value={project.description}
                enabled={project.access.canEdit}
                onChange={this.makeChangeEvent('description')}
                editor={<textarea />}
              >
                {project.description}
              </EditableText>
            </p>
          </div>
        </div>

        {this.renderDetails()}

        <h3 className="mt-4">Open Source Packages Used</h3>
        {this.renderRefPackages()}
        {this.renderUsedPackages()}
        {this.renderPackageEditor()}

        {!showPackageEditor &&
          this.getPackageCount() > 0 && (
            <div className="pull-right" id="build-buttons">
              <Link
                to={`/projects/${project.projectId}/build`}
                className="btn btn-success btn-lg"
              >
                Build Attribution Document
              </Link>
            </div>
          )}
      </>
    );
  }

  renderTools() {
    const { project } = this.props;
    const { showAddRelatedProjectModal } = this.state;

    return (
      <div className="float-right">
        <div id="acl-owner-info" className="text-muted small">
          owned by {this.getOwners()}
        </div>

        <div className="dropdown text-right mt-2">
          <button
            className="btn btn-outline-dark btn-sm dropdown-toggle"
            data-toggle="dropdown"
            id="tools-dropdown-toggle"
          >
            Tools
          </button>
          <div className="dropdown-menu dropdown-menu-right">
            {project.access.level === 'owner' ? (
              <Link
                to={`/projects/${project.projectId}/acl`}
                className="dropdown-item"
              >
                Edit Permissions
              </Link>
            ) : (
              <a
                href="#"
                title="You must be a project owner to edit permissions."
                className="dropdown-item disabled"
              >
                Edit Permissions
              </a>
            )}
            <a
              href="#"
              className="dropdown-item"
              onClick={this.addRelatedProject}
            >
              Add Related Project
            </a>
            <div className="dropdown-divider" />
            <Link
              to={`/projects/${project.projectId}/clone`}
              className="dropdown-item"
            >
              Clone this Project
            </Link>
          </div>
        </div>

        {showAddRelatedProjectModal && (
          <AddRelatedProjectModal
            projectId={project.projectId}
            onDismiss={this.hideRelatedProjectModal}
          />
        )}
      </div>
    );
  }

  renderDetails() {
    const { project } = this.props;

    const selectYesNo = (
      <select>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
    const legalContact =
      project.contacts.legal && project.contacts.legal.length > 0
        ? project.contacts.legal[0]
        : '';

    return (
      <dl className="row">
        <dt className="col-md-3">Planned release date</dt>
        <dd className="col-md-9" id="project-release-date">
          <EditableText
            value={project.plannedRelease.format('YYYY-MM-DD')}
            enabled={project.access.canEdit}
            onChange={this.makeChangeEvent('plannedRelease')}
            editor={<input type="date" pattern="\d{4}\-\d{2}-\d{2}" />}
          >
            {project.plannedRelease.format('ddd, MMMM Do YYYY')}
          </EditableText>
        </dd>

        <dt className="col-md-3">Legal contact</dt>
        <dd className="col-md-9" id="project-lawyer">
          <EditableText
            value={legalContact}
            enabled={project.access.canEdit}
            onChange={this.makeChangeEvent('contacts', false, 'legal')}
          >
            {legalContact}
          </EditableText>
        </dd>

        <dt className="col-md-3">Open sourcing</dt>
        <dd className="col-md-9" id="project-open-sourcing">
          <EditableText
            value={
              project.metadata.open_sourcing
                ? project.metadata.open_sourcing.toString()
                : 'false'
            }
            enabled={project.access.canEdit}
            onChange={this.makeChangeEvent('meta', true, 'open_sourcing')}
            editor={selectYesNo}
          >
            {project.metadata.open_sourcing ? 'Yes' : 'No'}
          </EditableText>
        </dd>

        <dt className="col-md-3">Related Projects</dt>
        <dd className="col-md-9">
          <ProjectRefInfo />
        </dd>
      </dl>
    );
  }

  renderRefPackages() {
    const {
      project: { refs, refInfo },
    } = this.props;
    if (!refInfo) {
      return;
    }

    return Object.entries(refs)
      .filter(([id, ref]) => ref.type === 'includes')
      .map(([id, ref]) => {
        const info = refInfo.refs[id];
        const packagesText =
          info.packageIds.length === 1 ? 'package' : 'packages';
        return (
          <div key={id} className="alert alert-secondary">
            Includes {info.packageIds.length} {packagesText} from {info.title}{' '}
            version {info.version}
          </div>
        );
      });
  }

  renderUsedPackages() {
    const {
      project: { packagesUsed },
    } = this.props;
    const { showPackageEditor, editPackageId } = this.state;
    if (packagesUsed.length === 0) {
      return (
        <div className="alert alert-info mt-3">
          <strong>Your project is empty!</strong> Add the open source packages
          you use here.
        </div>
      );
    }

    // don't show the package list if we're editing a specific package
    if (showPackageEditor && editPackageId != undefined) {
      return;
    }

    return packagesUsed.map((usage, index) => (
      <ProjectPackage
        key={usage.packageId}
        usage={usage}
        onEditPackage={() =>
          this.setState({
            showPackageEditor: true,
            editPackageId: usage.packageId,
          })
        }
      />
    ));
  }

  renderPackageEditor() {
    const { showPackageEditor, editPackageId } = this.state;
    const {
      packages,
      project: { packagesUsed, access },
    } = this.props;

    if (!access.canEdit) {
      return;
    }

    if (!showPackageEditor) {
      return (
        <button
          id="add-package"
          className="btn btn-primary"
          onClick={() => this.setState({ showPackageEditor: true })}
        >
          <i className="fa fa-plus" /> Add Package
        </button>
      );
    }

    if (editPackageId != undefined) {
      const usage = packagesUsed.find(x => x.packageId === editPackageId);
      const pkg = packages[editPackageId];
      return (
        <PackageEditor
          initialPackage={pkg}
          initialUsage={usage}
          onCompleted={() =>
            this.setState({
              showPackageEditor: false,
              editPackageId: undefined,
            })
          }
        />
      );
    }

    return (
      <PackageEditor
        onCompleted={() =>
          this.setState({
            showPackageEditor: false,
            editPackageId: undefined,
          })
        }
      />
    );
  }
}

export default connect((state: any) => ({
  project: state.projects.active,
  packages: state.packages.set,
  licenses: state.licenses.list,
}))(ProjectView);
