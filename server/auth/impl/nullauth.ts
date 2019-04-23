// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
    passport.use(
      new CookieStrategy(
        { cookieName: 'nullauth-dummy-user' },
        (token, done) => {
          done(undefined, { user: token } as AuthUser);
        }
      )
    );
    passport.use(
      new BasicStrategy((user, pass, done) => {
        done(undefined, user);
      })
    );

    // configure dummy login page
    app.get(
      '/dummy-login',
      passport.authenticate('basic', { session: false }),
      (req, res) => {
        res.cookie('nullauth-dummy-user', req.user);
        res.redirect('/');
      }
    );
    // selenium needs a page with no authentication to set a cookie on
    app.get('/dummy-no-auth', (req, res) => {
      res.send('OK');
    });
    // and cookie auth for the rest
    app.use(cookieParser());
    app.use(
      // also allow basic auth for tinkering with swagger ui
      passport.authenticate(['basic', 'cookie'], {
        session: false,
        failureRedirect: '/dummy-login',
      })
    );
  }

  extractRequestUser(request: any): string {
    return (
      request.get('X-REMOTE-USER') ||
      request.get('X-FORWARDED-USER') ||
      request.user.user ||
      process.env.USER ||
      'unknown'
    );
  }

  async getDisplayName(user: string): Promise<string | undefined> {
    // special test case; this user will never "exist"
    if (user === 'nobody') {
      return;
    }
    return user;
  }

  async getGroups(user: string): Promise<string[]> {
    return [`self:${user}`, 'everyone'];
  }
}
