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

import React = require('react');

interface Props {
  onClick: Function;
}

interface State {
  mode: ConfirmState;
}

enum ConfirmState {
  Initial,
  Lockout,
  Confirm,
}

export default class DetatchButton extends React.Component<Props, State> {
  timeout: any;

  constructor(props) {
    super(props);

    this.state = {
      mode: ConfirmState.Initial,
    };
  }

  clicked = (e) => {
    const { mode } = this.state;
    if (mode === ConfirmState.Initial) {
      this.setState({mode: ConfirmState.Lockout});
      setTimeout(() => {
        this.setState({mode: ConfirmState.Confirm});
        this.timeout = setTimeout(() => {
          this.setState({mode: ConfirmState.Initial});
        }, 3000);
      }, 500);
    } else if (mode === ConfirmState.Confirm) {
      clearTimeout(this.timeout);
      this.props.onClick();
    }
  }

  render() {
    const { mode } = this.state;
    return <button
      className={`btn btn-default package-remove-button ${mode === ConfirmState.Confirm && 'btn-danger'}`}
      onClick={this.clicked}
      disabled={mode === ConfirmState.Lockout}>
      {mode === ConfirmState.Confirm ? 'Delete?'
      : <i className="fa fa-ban"></i>}
    </button>;
  }

}
