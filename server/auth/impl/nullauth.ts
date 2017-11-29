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

import * as cookieParser from 'cookie-parser';
import { Express } from 'express';
import { PassportStatic } from 'passport';
import * as CookieStrategy from 'passport-cookie';
import { BasicStrategy } from 'passport-http';

import AuthBase, { AuthUser } from '../base';

export default class NullAuth implements AuthBase {

  /**
   * We use both cookies and HTTP basic auth here:
   *
   * Basic auth is used for a user-visible dummy login page, which sets a cookie.
   * HTTP Basic/digest auth can't be used in AJAX requests, hence the cookie strategy.
   *
   * If you're lucky, your environment might involve an authenticating reverse proxy
   * and you won't need to do any of this -- just check a header.
   */
  initialize(app: Express, passport: PassportStatic) {
    // register cookies and http basic strategies
    passport.use(new CookieStrategy({cookieName: 'nullauth-dummy-user'}, (token, done) => {
      done(null, {user: token} as AuthUser);
    }));
    passport.use(new BasicStrategy((user, pass, done) => {
      done(null, user);
    }));

    // configure dummy login page
    app.get('/dummy-login', passport.authenticate('basic', {session: false}), (req, res) => {
      res.cookie('nullauth-dummy-user', req.user);
      res.redirect('/');
    });
    // selenium needs a page with no authentication to set a cookie on
    app.get('/dummy-no-auth', (req, res) => {
      res.send('OK');
    });
    // and cookie auth for the rest
    app.use(cookieParser());
    app.use(passport.authenticate('cookie', {session: false, failureRedirect: '/dummy-login'}));
  }

  extractRequestUser(request: any): string {
    return request.get('X-REMOTE-USER') || request.get('X-FORWARDED-USER')
      || request.user.user || process.env.USER || 'unknown';
  }

  async getDisplayName(user: string): Promise<string | null> {
    // special test case; this user will never "exist"
    if (user === 'nobody') {
      return null;
    }
    return user;
  }

  async getGroups(user: string): Promise<string[]> {
    return [`self:${user}`, 'everyone'];
  }

}
