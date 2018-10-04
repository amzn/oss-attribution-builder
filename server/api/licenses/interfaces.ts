// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TagModule } from '../../licenses/interfaces';

export interface WebLicense {
  name: string;
  tags: string[];
}

export type WebTag = Pick<TagModule, 'presentation' | 'questions'>;
