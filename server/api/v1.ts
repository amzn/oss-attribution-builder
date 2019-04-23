// Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as express from 'express';

import { userInfo } from '../auth';
import { asyncApi } from '../util/middleware';
import licensesRouter from './licenses';
import packagesRouter from './packages';
import projectsRouter from './projects';

export let router = express.Router();
export default router;

// basic site/user info route
router.get('/info', asyncApi(userInfo));
router.use('/projects', projectsRouter);
router.use('/packages', packagesRouter);
router.use('/licenses', licensesRouter);
