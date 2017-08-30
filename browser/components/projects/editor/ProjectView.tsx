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
import * as LicenseActions from '../../../modules/licenses';
import * as ProjectActions from '../../../modules/projects';
import EditableText from '../../util/EditableText';
import AddPackageForm from './AddPackageForm';
import ProjectPackage from './ProjectPackage';

interface Props {
  dispatch: (action: any) => any;
  match: any;
  project: WebProject;
  licenses: WebLicense[];
}

interface State {
  showAddPackageForm: boolean;
}

class ProjectView extends Component<Props, State> {

  state = {
    showAddPackageForm: false,
  };

  componentWillMount() {
    const { dispatch, match: { params }, licenses } = this.props;
    dispatch(ProjectActions.fetchProjectDetail(params.projectId));

    // these are used in many sub-components. pre-load them now.
    if (licenses.length === 0) {
      dispatch(LicenseActions.fetchLicenses());
    }
  }

  componentWillUpdate(nextProps) {
    const { dispatch, match: { params } } = this.props;
    if (params.projectId === nextProps.match.params.projectId) {
      return;
    }

    dispatch(ProjectActions.fetchProjectDetail(nextProps.match.params.projectId));
  }

  showAddPackageForm = (show = true) => {
    this.setState({showAddPackageForm: show});
  }

  makeChangeEvent = (fieldName: string, bool?: boolean, extended?: string) => {
    const { dispatch, project } = this.props;
    return (value) => {
      if (bool) {
        value = value === 'true';
      }

      if (fieldName === 'contacts') {
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
    const { project, match: { params } } = this.props;
    const { showAddPackageForm } = this.state;

    // don't show the UI if the project data is stale and hasn't loaded
    if (project.projectId !== params.projectId) {
      return (<div>Loading project information...</div>);
    }

    const noPackagesBanner = (
      <div className="alert alert-info mt-3">
        <strong>Your project is empty!</strong> Add the open source packages you use here.
      </div>
    );

    const selectYesNo = (
      <select>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );

    const legalContact = project.contacts.legal && project.contacts.legal.length > 0 && project.contacts.legal[0];

    return (
      <div className="pb-5">
        <nav className="breadcrumb">
          <span className="breadcrumb-item active">Project Editor</span>
        </nav>

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
        {project.packagesUsed.length > 0 && project.packagesUsed.map((usage, index) =>
          <ProjectPackage key={index} usage={usage} />,
        ) || noPackagesBanner }

        <div>
          {project.access.canEdit &&
            (showAddPackageForm
              ? <AddPackageForm onCompleted={() => this.showAddPackageForm(false)} />
              : <button id="add-package" className="btn btn-primary" onClick={() => this.showAddPackageForm(true)}>
                  <i className="fa fa-plus"/> Add Package
                </button>
            )
          }

          {showAddPackageForm || project.packagesUsed.length === 0 ? '' :
            <div className="pull-right" id="build-buttons">
              <Link to={`/projects/${project.projectId}/build`} className="btn btn-success btn-lg">
                Build Attribution Document
              </Link>
            </div>
          }
        </div>
      </div>
    );
  }

}

export default connect((state) => ({
  project: state.projects.active,
  licenses: state.licenses.list,
}))(ProjectView);
