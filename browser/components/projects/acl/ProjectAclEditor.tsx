// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { connect } from 'react-redux';

import {
  AccessLevel,
  AccessLevelStrength,
  WebProject,
} from '../../../../server/api/v1/projects/interfaces';
import history from '../../../history';
import * as ProjectActions from '../../../modules/projects';
import ExtensionPoint from '../../../util/ExtensionPoint';

interface Props {
  dispatch: (action: any) => any;
  project: WebProject;
  globalACL: WebProject['acl'];
  groups: string[];
}

interface State {
  sortedAcl: Array<{ level: AccessLevel; resource: string }>;
}

class ProjectAclEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sortedAcl: ProjectAclEditor.getSortedAcl(props.project.acl),
    };
  }

  static getSortedAcl = (acl: WebProject['acl']) =>
    Object.keys(acl)
      .map(key => ({ level: acl[key], resource: key }))
      .sort(
        (a, b) =>
          AccessLevelStrength[a.level] < AccessLevelStrength[b.level] ? 1 : -1
      );

  changeLevel = (i: number, level: AccessLevel) => {
    this.setState({
      sortedAcl: this.state.sortedAcl.map(
        (key, j) => (i === j ? { ...key, level } : key)
      ),
    });
  };

  changeResource = (i: number, resource: string) => {
    this.setState({
      sortedAcl: this.state.sortedAcl.map(
        (key, j) => (i === j ? { ...key, resource } : key)
      ),
    });
  };

  deleteEntry = (i: number) => {
    this.setState({
      sortedAcl: this.state.sortedAcl.filter((key, j) => i !== j),
    });
  };

  addEntry = () => {
    this.setState({
      sortedAcl: [...this.state.sortedAcl, { level: 'viewer', resource: '' }],
    });
  };

  save = async e => {
    e.preventDefault();
    const {
      dispatch,
      project: { projectId },
    } = this.props;
    const { sortedAcl } = this.state;

    const newAcl = sortedAcl.reduce((acc, curr) => {
      acc[curr.resource] = curr.level;
      return acc;
    }, {});

    await dispatch(
      ProjectActions.patchProject(projectId, {
        acl: newAcl,
      })
    );
    history.push(`/projects/${projectId}`);
  };

  render() {
    const { globalACL } = this.props;
    const { sortedAcl } = this.state;

    const hasGlobalACL = Object.keys(globalACL).length > 0;

    return (
      <form onSubmit={this.save}>
        <h2>Manage project access</h2>

        <ExtensionPoint ext="project-acl-editor-top" />

        <table className="table table-bordered" id="project-acl-editor">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Permissions</th>
              <th>Group</th>
              <th style={{ width: '4ex' }} />
            </tr>
          </thead>
          <tbody>
            {sortedAcl.map((row, i) => (
              <AclRow
                key={i}
                level={row.level}
                resource={row.resource}
                onLevelChange={val => this.changeLevel(i, val)}
                onResourceChange={val => this.changeResource(i, val)}
                onDelete={() => this.deleteEntry(i)}
              />
            ))}
            <tr>
              <td colSpan={3}>
                <button
                  type="button"
                  id="acl-add"
                  className="btn btn-secondary"
                  onClick={this.addEntry}
                >
                  <i className="fa fa-plus" /> Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <ExtensionPoint ext="project-acl-editor-mid" />

        {hasGlobalACL && (
          <div>
            <ExtensionPoint ext="project-acl-editor-implicit-description">
              <p>The following also have acces to projects on this site:</p>
            </ExtensionPoint>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Permissions</th>
                  <th>Group</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(globalACL).map(key => (
                  <tr key={key}>
                    <td>{globalACL[key]}</td>
                    <td>{key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </form>
    );
  }
}

interface AclRowProps {
  level: AccessLevel;
  resource: string;
  onLevelChange: (val: AccessLevel) => void;
  onResourceChange: (val: string) => void;
  onDelete: () => void;
}
function AclRow(props: AclRowProps) {
  return (
    <tr>
      <td>
        <select
          className="form-control"
          value={props.level}
          onChange={e => props.onLevelChange(e.target.value as AccessLevel)}
        >
          <option value="owner">Owner</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </td>
      <td>
        <input
          type="text"
          className="form-control"
          value={props.resource}
          onChange={e => props.onResourceChange(e.target.value)}
        />
      </td>
      <td>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={props.onDelete}
        >
          <i className="fa fa-times" />
        </button>
      </td>
    </tr>
  );
}

export default connect((state: any) => ({
  globalACL: state.common.info.globalACL,
  project: state.projects.active,
  groups: state.common.info.groups ? state.common.info.groups : [],
}))(ProjectAclEditor);
