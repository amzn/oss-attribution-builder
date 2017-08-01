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
import { connect } from 'react-redux';
import { Link } from 'react-router';

import * as ProjectActions from '../../../modules/projects';
import AttributionDocWarning from './AttributionDocWarning';
import TextAnnotator from './TextAnnotator';

interface Props {
  dispatch: any;
  params: any;
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
    const { dispatch, params } = this.props;
    const activeProjectId = this.props.project.projectId;
    dispatch(ProjectActions.buildAttributionDoc(params.projectId));

    // reload the active project if it's not the one in the URL
    // (can happen via direct links to this)
    if (params.projectId !== activeProjectId) {
      dispatch(ProjectActions.fetchProjectDetail(params.projectId));
    }
  }

  saveAndDownload = async () => {
    const { dispatch, project: { projectId } } = this.props;
    await dispatch(ProjectActions.storeAttributionDoc(projectId));
  }

  /**
   * Create an on-click handler that will highlight an annotation
   * based on a warning structure.
   */
  bindWarning = (warning) => {
    const { annotations } = this.props.attributionDoc;

    // XXX: this aint hella efficient
    let found;
    for (const a of annotations) {
      if (AttributionDocBuilder.annotationMatch(a, warning)) {
        found = a;
        break;
      }
    }

    if (found == null) {
      return () => {};
    }

    return (event) => {
      this.setState({highlights: [found]});
    };
  }

  static annotationMatch(annotation, warning) {
    if (annotation.license != null) {
      return annotation.license === warning.license;
    } else if (annotation.package != null) {
      return annotation.package === warning.package;
    }

    return false;
  }

  render() {
    const { attributionDoc: { lines, warnings }, project: { title, version, projectId } } = this.props;
    const { highlights } = this.state;

    return (
      <div>
        <h2>{title} <small>version {version}</small></h2>

        <nav className="breadcrumb">
          <Link to={`/projects/${projectId}`} className="breadcrumb-item">Project Editor</Link>
          <span className="breadcrumb-item active">Attribution Document</span>
        </nav>

        <p>
          Below is a preview of your attribution document.
        </p>

        <p>
          <strong>To store a permanent copy, click the Save button below.</strong> You can create as many copies as you want and make edits after storing a copy. When you have a final version, save it here. You'll get a download as a text file and we'll store a rendered copy in our database.
        </p>
        <button type="submit" className="btn btn-success" onClick={this.saveAndDownload}>Save &amp; Download</button>

        {warnings.length > 0 ?
          <div className="mt-3">
            <h4>Warnings and Notes</h4>
            <p>
              Your document generated some warnings. Review these with your legal contact.
              You can click on a warning to highlight the relevant sections in your document.
            </p>
            {warnings.map((warning, index) =>
              <AttributionDocWarning
                warning={warning}
                key={index}
                onClick={this.bindWarning(warning)}
              />,
            )}
          </div>
        : ''}

        <h3 className="mt-4">Document Preview</h3>
        <div id="attribution-document-text" className="card">
          <div className="card-block">
            <TextAnnotator highlights={highlights}>{lines}</TextAnnotator>
          </div>
        </div>
      </div>
    );
  }

}

export default connect((state) => {
  return {
    attributionDoc: state.projects.attributionDoc,
    project: state.projects.active,
  };
})(AttributionDocBuilder);
