// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  projectId: string;
  title: string;
  version: string;
  createdOn: string;
}

export default class ProjectListItem extends Component<Props, {}> {
  render() {
    return (
      <li className="list-group-item">
        <Link to={`/projects/${this.props.projectId}`}>
          {this.props.title} {this.props.version}
        </Link>
        <small className="ml-1">created on {this.props.createdOn}</small>
      </li>
    );
  }
}
