// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const createBrowserHistory = require("history").createBrowserHistory;

// manually export our own history to make navigation outside react (i.e., in
// redux actions) easier.

export default createBrowserHistory();
