// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

'use strict';

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const prod = process.env.NODE_ENV === 'production';

let plugins = [
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    Popper: ['popper.js', 'default'],
  }),
  new MiniCssExtractPlugin({
    filename: '[name].css',
  }),
];

module.exports = {
  mode: prod ? 'production' : 'development',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.scss'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'browser/tsconfig.json',
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(woff2?|svg)(\?v=[\d\.]+)?$/,
        loader: 'url-loader?limit=10000',
      },
      {
        test: /\.(png|ttf|eot)(\?v=[\d\.]+)?$/,
        loader: 'file-loader',
      },
    ],
  },

  entry: {
    app: './browser/app.tsx',
    style: './styles/style.scss',
  },

  output: {
    path: path.join(__dirname, '/build/res'),
    filename: '[name].js',
    publicPath: '/res/',
  },

  devtool: prod ? 'source-map' : 'cheap-module-source-map',

  plugins,

  devServer: {
    port: 8010,
    publicPath: '/res/',
    proxy: {
      '*': 'http://localhost:8000',
    },
    stats: 'minimal',
  },
};
