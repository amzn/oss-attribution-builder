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
import { Link } from 'react-router';

interface Props {
  projectId: string;
  title: string;
  createdOn: string;
}

export default class ProjectListItem extends Component<Props, {}> {

  render() {
    return (
      <li className="list-group-item">
        <Link to={`/projects/${this.props.projectId}`}>
          {this.props.title}
        </Link>
        <small className="ml-1">
          created on {this.props.createdOn}
        </small>
      </li>
    );
  }

}
