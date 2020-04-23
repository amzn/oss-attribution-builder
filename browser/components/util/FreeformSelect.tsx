// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import Select from 'react-select';

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
  };

  private filterOptions(options, filter) {
    if (!filter || filter.length === 0) {
      return options;
    }

    const search = filter.toLowerCase();
    options = options.filter((o) => o.label.toLowerCase().includes(search));

    return [{ value: filter, label: filter, create: true }, ...options];
  }

  private optionRenderer = (option) => {
    const { optionRenderer } = this.props;

    if (option && option.create) {
      return (
        <span>
          <em>
            Add item <strong>{option.value}</strong>
          </em>
        </span>
      );
    }

    if (optionRenderer != undefined) {
      return optionRenderer(option);
    }

    return <span>{option.label}</span>;
  };

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
