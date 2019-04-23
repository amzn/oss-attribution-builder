// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface WebPackage {
  packageId: number;
  name: string;
  version: string;
  website?: string;
  license?: string;
  licenseText?: string;
  copyright?: string;
  createdBy?: string;
  verified?: boolean;
  extra?: {
    verification?: PackageVerification;
    stats?: PackageStats;
    latest?: number;
  };
}

export interface PackageVerification {
  verifiedOn: string;
  verifiedBy: string;
  comments: string;
}

export interface PackageStats {
  numProjects: number;
}
