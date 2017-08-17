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

'use strict';

const spawn = require('child_process').spawn;
const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const WebpackDevServer = require('webpack-dev-server');

const tsProject = ts.createProject('server/tsconfig.json');
gulp.task('build-server', ['copy-config'], () => {
  return gulp.src(['server/**/*.ts'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/server'));
});

const seleniumTsProject = ts.createProject('selenium/tsconfig.json');
gulp.task('build-selenium', () => {
  return gulp.src(['selenium/**/*.ts'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(seleniumTsProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/selenium'));
});

gulp.task('build-browser', () => {
  return gulp.src('browser/app.tsx')
    .pipe(plumber())
    .pipe(webpackStream(require('./webpack.config.js'), webpack))
    .pipe(gulp.dest('build/res'));
});


gulp.task('copy-assets', () => {
  return gulp.src('assets/**/*')
    .pipe(gulp.dest('build/server/assets'));
});

gulp.task('copy-config', () => {
  return gulp.src('config/**/*')
    .pipe(gulp.dest('build/config'));
});

gulp.task('test', ['build-server'], () => {
  require('source-map-support/register');
  require('core-js/shim');
  const winston = require('winston');
  winston.remove(winston.transports.Console);
  process.on('unhandledRejection', err => {console.error('\nUnhandled rejection:', err.stack)});
  return gulp.src('build/server/**/*.spec.js')
    .pipe(jasmine());
});

let node;
gulp.task('local-server', ['build-server'], done => {
  if (node) {
    node.kill();
  }

  // set development mode if unset
  process.env.NODE_ENV = process.env.NODE_ENV == null ? 'development' : process.env.NODE_ENV;

  // launch it
  node = spawn('node', ['build/server/localserver.js']);

  // pass through stdout and wait on a "ready" message in output
  node.stdout.on('data', data => {
    const text = data.toString();
    process.stdout.write(text);
    if (/server running/i.test(text)) {
      done();
    }
  });

  // pass through stderr
  node.stderr.on('data', data => {
    process.stderr.write(data.toString());
  });

  // if it exits early (i.e., not killed for reload) then finish with error
  node.on('close', (code, signal) => {
    if (signal == null) {
      done(`server exited prematurely (code ${code})`);
    }
  });
});

gulp.task('dev', ['copy-assets', 'local-server'], () => {
  gulp.watch(['server/**/*.ts'], {debounceDelay: 500}, ['local-server']);
  gulp.watch(['assets/**/*'], ['copy-assets']);

  const compiler = webpack(require('./webpack.config.js'));
  new WebpackDevServer(compiler, {
    publicPath: '/res/',
    proxy: {'*': 'http://localhost:8000'},
    stats: 'minimal',
  }).listen(8010, '0.0.0.0', err => {
    if (err) {
      throw new Error('webpack-dev-server error:', err);
    }
    console.log('Autoreload server running at http://0.0.0.0:8010/webpack-dev-server/');
  });
});

gulp.task('default', ['build-server', 'build-browser', 'copy-assets']);

process.on('exit', () => {
  if (node) {
    node.kill();
  }
});
