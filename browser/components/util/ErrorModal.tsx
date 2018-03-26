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
    $(this.self).modal({backdrop: 'static'});
  }

  hideModal = () => {
    $(this.self).modal('hide').on('hidden.bs.modal' as any, this.props.onDismiss);
  }

  render() {
    const { title, message, explain } = this.props;

    return (
      <div className="modal fade show" role="dialog" id="error-modal" ref={(r) => { if (r) { this.self = r; } } }>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              <p>There was a problem:<br/><strong>{message}</strong></p>
              <p>{explain}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={this.hideModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
