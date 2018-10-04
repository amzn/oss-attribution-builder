// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React = require('react');

interface Props {
  onClick: (event?: any) => any;
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

  clicked = e => {
    const { mode } = this.state;
    if (mode === ConfirmState.Initial) {
      this.setState({ mode: ConfirmState.Lockout });
      setTimeout(() => {
        this.setState({ mode: ConfirmState.Confirm });
        this.timeout = setTimeout(() => {
          this.setState({ mode: ConfirmState.Initial });
        }, 3000);
      }, 500);
    } else if (mode === ConfirmState.Confirm) {
      clearTimeout(this.timeout);
      this.props.onClick();
    }
  };

  render() {
    const { mode } = this.state;
    return (
      <button
        className={`btn btn-secondary package-remove-button ${mode ===
          ConfirmState.Confirm && 'btn-danger'}`}
        onClick={this.clicked}
        disabled={mode === ConfirmState.Lockout}
      >
        {mode === ConfirmState.Confirm ? (
          'Delete?'
        ) : (
          <i className="fa fa-ban" />
        )}
      </button>
    );
  }
}
