// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import Modal from '../../../util/Modal';
import { connect } from 'react-redux';
import { createRef } from '../../../../modules/projects';

interface OwnProps {
  projectId: string;
  onDismiss: (action: string) => void;
}

interface Props extends OwnProps {
  dispatch: (action: any) => any;
}

class AddRelatedProjectModal extends React.Component<Props, {}> {
  private prefix;

  constructor(props) {
    super(props);
    this.prefix = `${window.location.origin}/projects/`;
  }

  handleAction = (action: string) => {
    this.props.onDismiss(action);
  };

  submitForm = buttonAction => async (e: React.FormEvent<HTMLFormElement>) => {
    const { dispatch, projectId } = this.props;
    e.preventDefault();

    console.log(e.target);

    const url: string = e.target['relate-project-url'].value.trim();
    const include: boolean = e.target['relate-project-include'].checked;
    const comment: string = e.target['relate-project-comments'].value.trim();
    const targetProjectId = url.replace(this.prefix, '').split('/')[0];

    try {
      await dispatch(
        createRef(
          projectId,
          targetProjectId,
          include ? 'includes' : 'related',
          comment
        )
      );
    } catch (err) {
      console.log('some errrorrrrr');
    }
    buttonAction('add');
  };

  render() {
    return (
      <Modal title="Add Related Project" onDismiss={this.handleAction}>
        {buttonAction => (
          <form onSubmit={this.submitForm(buttonAction)}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="relate-project-url">Other Project Link</label>
                <input
                  type="text"
                  id="relate-project-url"
                  placeholder={`${this.prefix}abcdefgh`}
                  className="form-control"
                />
                <small className="form-text text-muted">
                  Paste in a link to the other project you're interested in.
                </small>
              </div>

              <p>
                This will create a one-way link from this project to the project
                you enter above. This can be for your own organization, or you
                can include packages from that project into this one. (If you'd
                instead like to embed this project inside another, open this
                pop-up on <em>that</em> project instead.)
              </p>

              <p>
                You'll need to have at least "viewer" access on the other
                project for this to work correctly.
              </p>

              <div className="form-group form-check">
                <input
                  type="checkbox"
                  id="relate-project-include"
                  className="form-check-input"
                />{' '}
                <label
                  htmlFor="relate-project-include"
                  className="form-check-label"
                >
                  Include packages from the above project into this one
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="relate-project-comments">Comments</label>
                <textarea
                  id="relate-project-comments"
                  className="form-control"
                />
                <small className="form-text text-muted">
                  For your own organizational purposes.
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={buttonAction('cancel')}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Link Projects
              </button>
            </div>
          </form>
        )}
      </Modal>
    );
  }
}

export default connect((state: any, props: OwnProps) => ({}))(
  AddRelatedProjectModal
);
