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

import * as Immutable from 'immutable';
import * as winston from 'winston';

import * as db from '../../db/packages';
import { assertCanValidate } from './auth';
import { WebPackage } from './interfaces';

export async function searchPackages(req: any, query: string): Promise<{results: WebPackage[]}> {
  const packages = await db.searchPackages(query, 25);
  return {results: packages.map((pkg) => ({
    packageId: pkg.package_id,
    name: pkg.name,
    version: pkg.version,
    website: pkg.website,
    license: pkg.license,
    copyright: pkg.copyright,
    licenseText: pkg.license_text,
    verified: pkg.verified,
  }))};
}

export async function getPackage(req: any, packageId: number, extended = false): Promise<WebPackage> {
  const pkg = await db.getPackage(packageId);
  if (pkg == null) {
    return null;
  }

  // fetch extended information if asked for
  const extra = {} as any;
  if (extended) {
    // look up verifications
    const verifications = await db.getPackageVerifications(packageId);
    if (verifications.length > 0) {
      const v = verifications[0];
      extra.verification = {
        verifiedOn: v.verified_on,
        verifiedBy: v.verified_by,
        comments: v.comments,
      };
    }

    // and latest revision ID
    const latest = await db.getLatestPackageRevision(pkg.name, pkg.version);
    extra.latest = latest.package_id;
  }

  // map DB types to a public API
  return {
    packageId: pkg.package_id,
    name: pkg.name,
    version: pkg.version,
    website: pkg.website,
    license: pkg.license,
    copyright: pkg.copyright,
    licenseText: pkg.license_text,
    verified: pkg.verified,
    extra,
  };
}

/**
 * Store a package revision in the database, unless nothing changed.
 *
 * Returns the new (or existing) package ID.
 */
export async function storePackage(req: any, packageId: number, info: Pick<WebPackage,
                                   'name' | 'version' | 'website' | 'copyright' | 'license' |
                                   'licenseText'>): Promise<number> {
  let shouldInsert = true;
  if (packageId != null) {
    const existing = await db.getPackage(packageId);

    // if it didn't exist we should obviously insert, otherwise compare the data
    if (existing != null) {
      const subset = Immutable.fromJS({
        name: existing.name,
        version: existing.version,
        website: existing.website,
        copyright: existing.copyright,
        license: existing.license,
        licenseText: existing.license_text,
      });
      const updated = Immutable.fromJS({
        name: info.name,
        version: info.version,
        website: info.website,
        copyright: info.copyright,
        license: info.license,
        licenseText: info.licenseText,
      });

      // should insert if they're not the same
      shouldInsert = !Immutable.is(subset, updated);
    }
  }

  // create a new revision if anything changed (or it didn't exist)
  let newId: number;
  if (shouldInsert) {
    const createdBy = req.user.user;
    newId = await db.createPackageRevision(info.name, info.version, info.website, info.license, info.copyright, info.licenseText, createdBy);
    winston.info('Created a new package revision with ID %s (previous revision at %s) by %s',
      newId, packageId ? packageId : '[none]', createdBy);
  } else {
    newId = packageId;
    winston.info('Package %s has no submitted modifications', packageId);
  }

  return newId;
}

export async function verifyPackage(req: any, packageId: number, verified: boolean,
                                    comments: string): Promise<Partial<WebPackage>> {
  assertCanValidate(req);
  await Promise.all([
    db.addVerification(packageId, req.user.user, comments),
    db.verifyPackage(packageId, verified),
  ]);
  winston.info('Package %s verified (%s) by %s', packageId, verified, req.user.user);
  return {packageId};
}

export async function getVerificationQueue(req: any): Promise<{queue: Array<Partial<WebPackage>>}> {
  assertCanValidate(req);
  const results = await db.getUnverifiedPackages(25);
  const queue = results.map((item) => ({
    packageId: item.package_id,
    name: item.name,
    version: item.version,
    extra: { stats: { numProjects: parseInt(item.count) } },
  }));
  return {queue};
}
