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

import { WebLicense } from '../../../../server/api/licenses/interfaces';
import { WebProject } from '../../../../server/api/projects/interfaces';
import * as PackageActions from '../../../modules/packages';
import * as ProjectActions from '../../../modules/projects';
import EditableText from '../../util/EditableText';
import PackageEditor from './PackageEditor';
import ProjectPackage from './ProjectPackage';

interface Props {
  dispatch: (action: any) => any;
  project: WebProject;
  packages: PackageActions.PackageSet;
  licenses: WebLicense[];
}

interface State {
  editPackageId: number | null;
  showPackageEditor: boolean;
}

class ProjectView extends Component<Props, State> {

  state = {
    editPackageId: null,
    showPackageEditor: false,
  };

  getOwners() {
    const { project: { acl } } = this.props;
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
    return (value) => {
      if (bool) {
        value = value === 'true';
      }

      if (fieldName === 'contacts') {
        if (extended == null) {
          throw new Error('contacts extended data must not be null');
        }

        // transform a single contact field into a change of the contacts map
        // note that this is only capable of supporting a single contact of
        // each type, but this could easily be changed
        dispatch(ProjectActions.patchProject(project.projectId, {
          contacts: {
            ...project.contacts,
            [extended]: [value],
          },
        }));
      } else if (fieldName === 'meta') {
        if (extended == null) {
          throw new Error('meta extended data must not be null');
        }

        // transform a single meta edit into an updated meta map
        dispatch(ProjectActions.patchProject(project.projectId, {
          metadata: {
            ...project.metadata,
            [extended]: value,
          },
        }));
      } else {
        // everything else
        dispatch(ProjectActions.patchProject(project.projectId, {
          [fieldName]: value,
        }));
      }
    };
  }

  render() {
    const { project } = this.props;
    const { showPackageEditor } = this.state;

    const selectYesNo = (
      <select>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );

    const legalContact = project.contacts.legal && project.contacts.legal.length > 0 && project.contacts.legal[0];

    return (
      <div className="pb-5">
        {project.access.level === 'owner' ?
          <div id="acl-owner-info" className="float-right text-muted small EditableText">
            <Link to={`/projects/${project.projectId}/acl`}>owned by {this.getOwners()}</Link>
          </div>
        :
          <div id="acl-owner-info" className="float-right text-muted small">
            owned by {this.getOwners()}
          </div>
        }

        <h2 id="project-heading">
          <EditableText
            value={project.title}
            enabled={project.access.canEdit}
            onChange={this.makeChangeEvent('title')}>
            {project.title}
          </EditableText>
          {' '}
          <small id="project-version">
            <EditableText
              value={project.version}
              enabled={project.access.canEdit}
              onChange={this.makeChangeEvent('version')}>
              version {project.version}
            </EditableText>
          </small>
        </h2>

        <p><small>Created <strong title={project.createdOn.format()}>{project.createdOn.fromNow()}</strong></small>.</p>

        <p className="lead" id="project-description">
          <EditableText
            value={project.description}
            enabled={project.access.canEdit}
            onChange={this.makeChangeEvent('description')}
            editor={<textarea/>}>
            {project.description}
          </EditableText>
        </p>

        <dl className="row">
          <dt className="col-md-3">Planned release date</dt>
          <dd className="col-md-9" id="project-release-date">
            <EditableText
              value={project.plannedRelease.format('YYYY-MM-DD')}
              enabled={project.access.canEdit}
              onChange={this.makeChangeEvent('plannedRelease')}
              editor={<input type="date" pattern="\d{4}\-\d{2}-\d{2}"/>}>
              {project.plannedRelease.format('ddd, MMMM Do YYYY')}
            </EditableText>
          </dd>

          <dt className="col-md-3">Legal contact</dt>
          <dd className="col-md-9" id="project-lawyer">
            <EditableText
              value={legalContact}
              enabled={project.access.canEdit}
              onChange={this.makeChangeEvent('contacts', false, 'legal')}>
              {legalContact}
            </EditableText>
          </dd>

          <dt className="col-md-3">Open sourcing</dt>
          <dd className="col-md-9" id="project-open-sourcing">
            <EditableText
              value={project.metadata.open_sourcing.toString()}
              enabled={project.access.canEdit}
              onChange={this.makeChangeEvent('meta', true, 'open_sourcing')}
              editor={selectYesNo}>
              {project.metadata.open_sourcing ? 'Yes' : 'No'}
            </EditableText>
          </dd>
        </dl>

        <h3>Open Source Packages Used</h3>
        {this.renderUsedPackages()}
        {this.renderPackageEditor()}

        {showPackageEditor || project.packagesUsed.length === 0 ? '' :
          <div className="pull-right" id="build-buttons">
            <Link to={`/projects/${project.projectId}/build`} className="btn btn-success btn-lg">
              Build Attribution Document
            </Link>
          </div>
        }
      </div>
    );
  }

  renderUsedPackages() {
    const { project: { packagesUsed } } = this.props;
    const { showPackageEditor, editPackageId } = this.state;
    if (packagesUsed.length === 0) {
      return <div className="alert alert-info mt-3">
        <strong>Your project is empty!</strong> Add the open source packages you use here.
      </div>;
    }

    // don't show the package list if we're editing a specific package
    if (showPackageEditor && editPackageId != null) {
      return;
    }

    return packagesUsed.map((usage, index) =>
      <ProjectPackage
        key={usage.packageId}
        usage={usage}
        onEditPackage={() => this.setState({
          showPackageEditor: true,
          editPackageId: usage.packageId,
        })}
      />,
    );
  }

  renderPackageEditor() {
    const { showPackageEditor, editPackageId } = this.state;
    const { packages, project: { packagesUsed, access } } = this.props;

    if (!access.canEdit) {
      return;
    }

    if (!showPackageEditor) {
      return <button id="add-package" className="btn btn-primary"
        onClick={() => this.setState({showPackageEditor: true})}>
        <i className="fa fa-plus" /> Add Package
      </button>;
    }

    if (editPackageId != null) {
      const usage = packagesUsed.find((x) => x.packageId === editPackageId);
      const pkg = packages[editPackageId];
      return <PackageEditor
        initialPackage={pkg}
        initialUsage={usage}
        onCompleted={() => this.setState({
          showPackageEditor: false,
          editPackageId: null,
        })}
      />;
    }

    return <PackageEditor
      onCompleted={() => this.setState({
        showPackageEditor: false,
        editPackageId: null,
      })}
    />;
  }

}

export default connect((state: any) => ({
  project: state.projects.active,
  packages: state.packages.set,
  licenses: state.licenses.list,
}))(ProjectView);
