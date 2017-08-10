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
import * as Select from 'react-select';

interface Props {
  name: string;
  value?: any;
  options: any[];
  placeholder?: string;
  onChange: any;
  optionRenderer: any;
}

export default class FreeformSelect extends Component<Props, {}> {

  onChange = (selected) => {
    this.props.onChange(selected);
  }

  private filterOptions(options, filter) {
    if (!filter || filter.length === 0) {
      return options;
    }

    const search = filter.toLowerCase();
    options = options.filter((o) => o.label.toLowerCase().includes(search));

    return [
      {value: filter, label: filter, create: true},
      ...options,
    ];
  }

  private optionRenderer = (option) => {
    const { optionRenderer } = this.props;

    if (option && option.create) {
      return (<span><em>Add item <strong>{option.value}</strong></em></span>);
    }

    if (optionRenderer != null) {
      return optionRenderer(option);
    }

    return (<span>{option.label}</span>);
  }

  render() {
    return (
      <Select
        name={this.props.name}
        value={this.props.value}
        options={this.props.options}
        placeholder={this.props.placeholder}
        onChange={this.onChange}
        filterOptions={this.filterOptions}
        optionRenderer={this.optionRenderer}
      />
    );
  }

}
