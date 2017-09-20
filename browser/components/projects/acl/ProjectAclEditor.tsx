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
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { AccessLevel, AccessLevelStrength, WebProject } from '../../../../server/api/projects/interfaces';
import * as ProjectActions from '../../../modules/projects';
import GroupSelect from './GroupSelect';

interface Props {
  dispatch: (action: any) => any;
  project: WebProject;
  groups: string[];
}

interface State {
  sortedAcl: Array<{level: AccessLevel, resource: string}>;
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
      .map((key) => ({level: acl[key], resource: key}))
      .sort((a, b) => AccessLevelStrength[a.level] < AccessLevelStrength[b.level] ? 1 : -1)

  changeLevel = (i: number, level: AccessLevel) => {
    this.setState({
      sortedAcl: this.state.sortedAcl.map((key, j) => i === j ? {...key, level} : key),
    });
  }

  changeResource = (i: number, resource: string) => {
    this.setState({
      sortedAcl: this.state.sortedAcl.map((key, j) => i === j ? {...key, resource} : key),
    });
  }

  deleteEntry = (i: number) => {
    this.setState({
      sortedAcl: this.state.sortedAcl.filter((key, j) => i !== j),
    });
  }

  addEntry = () => {
    this.setState({
      sortedAcl: [
        ...this.state.sortedAcl,
        {level: 'viewer', resource: null},
      ],
    });
  }

  save = (e) => {
    e.preventDefault();
    const { dispatch, project: { projectId } } = this.props;
    const { sortedAcl } = this.state;

    const newAcl = sortedAcl.reduce((acc, curr) => {
      acc[curr.resource] = curr.level;
      return acc;
    }, {});

    dispatch(ProjectActions.patchProject(projectId, {
      acl: newAcl,
    }));
  }

  render() {
    const { groups } = this.props;
    const { sortedAcl } = this.state;

    return <div>
      <h2>Manage project access</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th style={{ width: '20%' }}>Permissions</th>
            <th>Group</th>
            <th style={{ width: '4ex' }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedAcl.map((row, i) =>
            <AclRow
              key={i}
              level={row.level}
              resource={row.resource}
              onLevelChange={(val) => this.changeLevel(i, val)}
              onResourceChange={(val) => this.changeResource(i, val)}
              onDelete={() => this.deleteEntry(i)}
            />)}
        </tbody>
        <tr>
          <td colSpan={3}>
            <button className="btn btn-secondary" onClick={this.addEntry}>
              <i className="fa fa-plus" /> Add
            </button>
          </td>
        </tr>
      </table>

      <button className="btn btn-primary" onClick={this.save}>
        Save
      </button>
    </div>;
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
  return <tr>
    <td>
      <select className="form-control" value={props.level}
        onChange={(e) => props.onLevelChange(e.target.value as AccessLevel)}>
        <option value="owner">Owner</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
    </td>
    <td>
      <input type="text" className="form-control" value={props.resource}
        onChange={(e) => props.onResourceChange(e.target.value)}
      />
    </td>
    <td>
      <button className="btn btn-secondary" onClick={props.onDelete}>
        <i className="fa fa-times" />
      </button>
    </td>
  </tr>;
}

export default connect((state) => ({
  project: state.projects.active,
}))(ProjectAclEditor);
