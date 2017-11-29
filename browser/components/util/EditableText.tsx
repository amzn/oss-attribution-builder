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

interface Props {
  editor?: any;
  value: string;
  onChange: any;
  enabled?: boolean;
}

interface State {
  editing: boolean;
}

export default class EditableText extends Component<Props, State> {

  constructor(props) {
    super(props);

    this.state = {
      editing: false,
    };
  }

  get enabled() {
    if (this.props.enabled != null) {
      return this.props.enabled;
    }

    return true;
  }

  edit = () => {
    this.setState({editing: true});
  }

  focus = (ele: HTMLElement) => {
    if (ele != null && ele.focus != null) {
      ele.focus();
    }
  }

  save = (e: React.KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement;
    // use built-in validity checker for special widgets
    if (!target.checkValidity()) {
      return;
    }

    const val = target.value;

    // don't close/save for empty values
    if (val == null || val.trim().length === 0) {
      return;
    }

    this.setState({editing: false});

    // ignore unchanged fields
    if (val === this.props.value) {
      return;
    }

    this.props.onChange(val);
  }

  render() {
    if (!this.state.editing) {
      if (this.enabled) {
        return (
          <span className="EditableText" onClick={this.edit}>
            {this.props.children}
          </span>
        );
      } else {
        return (
          <span>{this.props.children}</span>
        );
      }
    }

    let editor = this.props.editor || (<input type="text" />);
    editor = React.cloneElement(editor, {
      defaultValue: this.props.value,
      className: 'form-control',
      onBlur: this.save,
      onKeyPress: (e) => e.key === 'Enter' ? this.save(e) : null,
      required: true,
      style: {
        width: '100%',
      },
      ref: this.focus,
    });
    return (
      <span>{editor}</span>
    );
  }

}
