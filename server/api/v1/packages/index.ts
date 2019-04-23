// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as express from 'express';
import * as Immutable from 'immutable';
import * as winston from 'winston';

import auth from '../../../auth';
import * as db from '../../../db/packages';
import { asyncApi } from '../../../util/middleware';
import { assertCanValidate } from './auth';
import { WebPackage } from './interfaces';

export const router = express.Router();
export default router;

/**
 * Search all packages by name/version.
 */
router.post(
  '/',
  asyncApi(
    async (req, res): Promise<{ results: WebPackage[] }> => {
      const query = req.body.query;
      const packages = await db.searchPackages(query, 25);
      return {
        results: packages.map(pkg => ({
          packageId: pkg.package_id,
          name: pkg.name,
          version: pkg.version,
          website: pkg.website,
          license: pkg.license,
          copyright: pkg.copyright,
          licenseText: pkg.license_text,
          verified: pkg.verified,
        })),
      };
    }
  )
);

/**
 * Admin action: fetch the package verification queue.
 */
router.get(
  '/verification',
  asyncApi(async (req, res) => {
    await assertCanValidate(req);
    const results = await db.getUnverifiedPackages(25);
    const queue = results.map(item => ({
      packageId: item.package_id,
      name: item.name,
      version: item.version,
      extra: { stats: { numProjects: parseInt(item.count, 10) } },
    }));
    return { queue };
  })
);

/**
 * Get a single package.
 */
router.get(
  '/:packageId',
  asyncApi(
    async (req, res): Promise<WebPackage | undefined> => {
      const {
        params: { packageId },
        query: { extended },
      } = req;

      const pkg = await db.getPackage(packageId);
      if (pkg == undefined) {
        return undefined;
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
        createdBy: pkg.created_by,
        verified: pkg.verified,
        extra,
      };
    }
  )
);

/**
 * Admin action: verify (accept/reject with comments) a single package.
 */
router.post(
  '/:packageId/verify',
  asyncApi(async (req, res) => {
    const {
      params: { packageId },
      body: { verified, comments },
    } = req;

    const user = auth.extractRequestUser(req);
    await assertCanValidate(req);

    await Promise.all([
      db.addVerification(packageId, user, comments),
      db.verifyPackage(packageId, verified),
    ]);

    winston.info('Package %s verified (%s) by %s', packageId, verified, user);
    return { packageId };
  })
);

/**
 * Store a package revision in the database, unless nothing changed.
 *
 * Returns the new (or existing) package ID.
 *
 * Not a route; used in projects when attaching a package.
 */
export async function storePackage(
  req: any,
  packageId: number,
  info: Pick<
    WebPackage,
    'name' | 'version' | 'website' | 'copyright' | 'license' | 'licenseText'
  >
): Promise<number> {
  let shouldInsert = true;
  if (packageId != undefined) {
    const existing = await db.getPackage(packageId);

    // if it didn't exist we should obviously insert, otherwise compare the data
    if (existing != undefined) {
      const subset = Immutable.fromJS({
        name: existing.name,
        version: existing.version,
        website: existing.website || undefined,
        copyright: existing.copyright || undefined,
        license: existing.license || undefined,
        licenseText: existing.license_text || undefined,
      });
      const updated = Immutable.fromJS({
        name: info.name,
        version: info.version,
        website: info.website || undefined,
        copyright: info.copyright || undefined,
        license: info.license || undefined,
        licenseText: info.licenseText || undefined,
      });

      // should insert if they're not the same
      shouldInsert = !Immutable.is(subset, updated);
    }
  }

  // create a new revision if anything changed (or it didn't exist)
  let newId: number;
  if (shouldInsert) {
    const createdBy = auth.extractRequestUser(req);
    newId = await db.createPackageRevision(
      info.name,
      info.version,
      info.website as string,
      info.license as string,
      info.copyright as string,
      info.licenseText as string,
      createdBy
    );
    winston.info(
      'Created a new package revision with ID %s (previous revision at %s) by %s',
      newId,
      packageId ? packageId : '[none]',
      createdBy
    );
  } else {
    newId = packageId;
    winston.info('Package %s has no submitted modifications', packageId);
  }

  return newId;
}
