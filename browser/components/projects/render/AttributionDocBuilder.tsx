// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import * as ProjectActions from '../../../modules/projects';
import AttributionDocWarning from './AttributionDocWarning';
import TextAnnotator from './TextAnnotator';

interface Props {
  dispatch: (action: any) => any;
  attributionDoc: any;
  project: any;
}

interface State {
  highlights: any[];
}

class AttributionDocBuilder extends Component<Props, State> {
  state = {
    highlights: [],
  };
  componentWillMount() {
    const {
      dispatch,
      project: { projectId },
    } = this.props;
    dispatch(ProjectActions.buildAttributionDoc(projectId));
  }

  saveAndDownload = async () => {
    const {
      dispatch,
      project: { projectId },
    } = this.props;
    await dispatch(ProjectActions.storeAttributionDoc(projectId));
  };

  /**
   * Create an on-click handler that will highlight an annotation
   * based on a warning structure.
   */
  bindWarning = warning => {
    const { annotations } = this.props.attributionDoc;

    // XXX: this aint hella efficient
    let found;
    for (const a of annotations) {
      if (AttributionDocBuilder.annotationMatch(a, warning)) {
        found = a;
        break;
      }
    }

    if (found == undefined) {
      return () => undefined;
    }

    return event => {
      this.setState({ highlights: [found] });
    };
  };

  static annotationMatch(annotation, warning) {
    if (annotation.license != undefined) {
      return annotation.license === warning.license;
    } else if (annotation.package != undefined) {
      return annotation.package === warning.package;
    }

    return false;
  }

  render() {
    const {
      attributionDoc: { lines, warnings },
      project: { title, version },
    } = this.props;
    const { highlights } = this.state;

    return (
      <div>
        <h2>
          {title} <small>version {version}</small>
        </h2>

        <p>Below is a preview of your attribution document.</p>

        <p>
          <strong>
            To store a permanent copy, click the Save button below.
          </strong>{' '}
          You can create as many copies as you want and make edits after storing
          a copy. When you have a final version, save it here. You'll get a
          download as a text file and we'll store a rendered copy in our
          database.
        </p>
        <button
          type="submit"
          className="btn btn-success"
          onClick={this.saveAndDownload}
        >
          Save &amp; Download
        </button>

        {warnings.length > 0 ? (
          <div className="mt-3">
            <h4>Warnings and Notes</h4>
            <p>
              Your document generated some warnings. Review these with your
              legal contact. You can click on a warning to highlight the
              relevant sections in your document.
            </p>
            {warnings.map((warning, index) => (
              <AttributionDocWarning
                warning={warning}
                key={index}
                onClick={this.bindWarning(warning)}
              />
            ))}
          </div>
        ) : (
          ''
        )}

        <h3 className="mt-4">Document Preview</h3>
        <div id="attribution-document-text" className="card">
          <div className="card-body">
            <TextAnnotator highlights={highlights}>{lines}</TextAnnotator>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state: any) => {
  return {
    attributionDoc: state.projects.attributionDoc,
    project: state.projects.active,
  };
})(AttributionDocBuilder);
