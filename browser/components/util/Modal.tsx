// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import * as ReactDOM from 'react-dom';

type EventCreator = (
  actionName: string
) => (event: React.MouseEvent<HTMLElement>) => void;

interface Props {
  title: string;
  dialogClass?: string;
  onDismiss: (actionName: string) => any;
  children: (buttonAction: EventCreator) => JSX.Element;
}

interface State {
  invokedAction: string;
}

export default class Modal extends React.Component<Props, State> {
  private self?: HTMLElement;
  private anchor = document.getElementById('modal-container');

  componentDidMount() {
    // for some reason (bug in BS4.b2?) clicking the backdrop instead of close
    // causes the modal to hang and not re-open. test this before removing
    // 'static' below.
    $(this.self as Record<string, any>).modal({ backdrop: 'static' });
  }

  hideModal = () => {
    $(this.self as Record<string, any>)
      .modal('hide')
      .on('hidden.bs.modal' as any, this.onDismiss);
  };

  onDismiss = () => {
    this.props.onDismiss(this.state.invokedAction);
  };

  buttonActionCreator = (actionName: string) => {
    return (event) => {
      this.setState({
        invokedAction: actionName,
      });
      this.hideModal();
    };
  };

  render() {
    const { title, children, dialogClass } = this.props;

    return ReactDOM.createPortal(
      <div
        className="modal fade show"
        role="dialog"
        id="error-modal"
        ref={(r) => {
          if (r) {
            this.self = r;
          }
        }}
      >
        <div className={`modal-dialog ${dialogClass || ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{title}</h4>
            </div>
            {children(this.buttonActionCreator)}
          </div>
        </div>
      </div>,
      this.anchor!
    );
  }
}
