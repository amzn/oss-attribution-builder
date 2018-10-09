// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AccessLevel, DbProjectRef } from '../../db/projects';

export interface WebProject {
  projectId: string;
  title: string;
  version: string;
  description: string;
  plannedRelease: any;
  createdOn: any;
  contacts: { [key: string]: string[] };
  acl: { [key: string]: AccessLevel };
  packagesUsed: PackageUsage[];
  refs: { [projectId: string]: DbProjectRef }
  metadata: { [key: string]: any };
  access: {
    level: AccessLevel;
    canEdit: boolean;
  };
}

export interface PackageUsage {
  packageId: number;
  notes?: string;
  // tag-added properties
  [key: string]: string | boolean | number | undefined;
}

export const AccessLevelStrength: { [key: string]: number } = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

export { AccessLevel } from '../../db/projects';