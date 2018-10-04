// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import ProjectListItem from './ProjectListItem';

interface Props {
  projects: any[];
}

export default class ProjectList extends Component<Props, {}> {
  render() {
    return (
      <ul className="list-group">
        {this.props.projects.map((project, index) => (
          <ProjectListItem {...project} key={index} />
        ))}
      </ul>
    );
  }
}
