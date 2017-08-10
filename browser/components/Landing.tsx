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
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { getClaims, getToken } from '../util/auth';

interface Props {
  dispactch: any;
  admin?: boolean;
}

interface State {
  user: any;
}

class Landing extends React.Component<Props, State> {
  state = {
    user: null,
  };

  componentWillMount() {
    // this is a little dumb... but in order to display the current user,
    // we need to authenticate.
    getToken().then(() => {
      this.setState({user: getClaims().user});
    });
  }

  render() {
    const { admin } = this.props;

    return (
      <div className="jumbotron">
        <h3>{this.state.user ? `Hello, ${this.state.user}` : 'Hello'}</h3>
        <p>
          This tool helps you build an attribution document to use in a distributed product.
        </p>
        We organize attribution documents by project.
        You can create a new project or browse your projects below.
        We'll ask you for some basic details about your product,
        such as who your legal contact is and when you plan to distribute or launch.
        Then you'll build a list of all of the open source packages you use and their licenses.
        These packages and their licenses will form your attribution document.
        <br/><br/>
        <p>
          <Link to="/projects/new" className="btn btn-primary btn-lg">New Project</Link>{' '}
          <Link to="/projects/" className="btn btn-secondary btn-lg">My Projects</Link>{' '}
          {admin ?
            <Link to="/projects/?all=1" className="btn btn-secondary btn-sm">All Projects</Link>
          : ''}
        </p>
      </div>
    );
  }
}

export default connect((state) => ({
  admin: state.common.claims != null ? state.common.claims.admin as boolean : null,
}))(Landing as any);
