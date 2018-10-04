// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';

interface Props {
  title: string;
  message: string;
  explain: string;
  onDismiss?: (event: any) => any;
}

export default class ErrorModal extends Component<Props, {}> {
  private self?: HTMLElement;

  componentDidMount() {
    // for some reason (bug in BS4.b2?) clicking the backdrop instead of close
    // causes the modal to hang and not re-open. test this before removing
    // 'static' below.
    $(this.self).modal({ backdrop: 'static' });
  }

  hideModal = () => {
    $(this.self)
      .modal('hide')
      .on('hidden.bs.modal' as any, this.props.onDismiss);
  };

  render() {
    const { title, message, explain } = this.props;

    return (
      <div
        className="modal fade show"
        role="dialog"
        id="error-modal"
        ref={r => {
          if (r) {
            this.self = r;
          }
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              <p>
                There was a problem:
                <br />
                <strong>{message}</strong>
              </p>
              <p>{explain}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={this.hideModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
