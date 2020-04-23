// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import DocBuilder, {
  LicenseBucket,
  LicenseDictionary,
  NamedLicense,
  Package as TagPackage,
} from 'tiny-attribution-generator';
import uuidv5 = require('uuid/v5');

import * as packagedb from '../../../db/packages';
import * as db from '../../../db/projects';
import { licenses, mapTag } from '../../../licenses';
import { ValidationResult } from '../../../licenses/interfaces';

type ProjectPackage = TagPackage<{
  projectId: string;
  packageId: number;
  usage: db.DbPackageUsage;
}>;

// arbitrary!
const OSSAB_UUID = 'fc80ccb3-9541-492a-9216-4326befe8d67';

/**
 * Add all packages from the given project to a t-a-g DocBuilder.
 */
export async function addProjectPackages(
  project: db.DbProject,
  builder: DocBuilder
) {
  // optimization: fetch all package ids at once, then organize into a map
  const packageIds = project.packages_used.map((usage) => usage.package_id);
  const packageList = await packagedb.getPackages(packageIds);
  const packages: Map<number, packagedb.Package> = packageList.reduce(
    (map, pkg) => {
      map.set(pkg.package_id, pkg);
      return map;
    },
    new Map()
  );

  // add the project's packages to the builder
  for (const usage of project.packages_used) {
    const dbPackage = packages.get(usage.package_id);
    if (dbPackage == undefined) {
      throw new Error(`Reference to package ${usage.package_id} was not found`);
    }
    const pkg = dbPackageToTagPackage(dbPackage);
    pkg.extra = {
      projectId: project.project_id,
      packageId: dbPackage.package_id,
      usage,
    };
    builder.addPackage(pkg);
  }
}

function dbPackageToTagPackage(dbPackage: packagedb.Package): ProjectPackage {
  return {
    uuid: uuidv5(dbPackage.package_id.toString(), OSSAB_UUID),
    name: dbPackage.name,
    version: dbPackage.version,
    website: dbPackage.website,
    license: dbPackage.license,
    text: dbPackage.license_text,
    copyrights:
      dbPackage.copyright && dbPackage.copyright.length > 0
        ? [dbPackage.copyright]
        : [],
  };
}

/**
 * Process a document summary and generate relevant warnings.
 *
 * These can be surfaced in the UI.
 */
export function getWarnings(builder: DocBuilder): ValidationResult[] {
  const { usedLicenses } = builder.summary;
  const warnings: ValidationResult[] = [];

  for (const [key, bucket] of Object.entries(usedLicenses)) {
    const mappedTags = bucket.tags.map((t) => mapTag(t));

    for (const mod of mappedTags) {
      // validate tag usage against a license
      if (mod.validateSelf) {
        const selfResult = mod.validateSelf(
          bucket.name,
          bucket.text,
          bucket.tags
        );
        if (selfResult) {
          appendWarnings(warnings, selfResult, {
            license: bucket.name,
            bucket: key,
          });
        }
      }

      // validate tag against a specific package's usage details
      for (const pkg of bucket.packages) {
        if (mod.validateUsage) {
          const usageResult = mod.validateUsage(pkg, pkg.extra.usage);
          if (usageResult) {
            appendWarnings(warnings, usageResult, {
              package: pkg.uuid,
              label: `${pkg.name} ${pkg.version}`,
            });
          }
        }
      }
    }
  }

  return warnings;
}

function appendWarnings(
  existing: ValidationResult[],
  add: ValidationResult[],
  extra: { [k: string]: any }
) {
  add.map((w) => ({ ...w, ...extra })).forEach((w) => existing.push(w));
  existing.concat(add);
}

/**
 * Apply any transformLicense tags on a bucket.
 *
 * Called by t-a-g during render finalize.
 */
export function applyTextTransforms(
  text: string,
  bucket: LicenseBucket
): string {
  let out = text;
  // re-map the `usage` key back to top-level for compatibility
  const packages = bucketPackagesCompat(bucket.packages);
  for (const tag of bucket.tags) {
    const mod = mapTag(tag);
    if (mod.transformLicense) {
      out = mod.transformLicense(out, packages);
    }
  }
  return out;
}

/**
 * Apply any transformCopyright tags on a bucket.
 *
 * Also called by t-a-g during finalize, but we don't touch the text here.
 * We just abuse this phase to hack the copyrights field.
 */
export function applyCopyrightTransforms(text: string, bucket: LicenseBucket) {
  // note: bucketPackagesCompat creates a clone of bucket.packages,
  // so if any changes need to be made they need to be applied back to
  // bucket.packages and not its clone.
  // https://github.com/amzn/oss-attribution-builder/issues/33
  const packagesCompatClone = bucketPackagesCompat(bucket.packages);
  for (const tag of bucket.tags) {
    const mod = mapTag(tag);
    if (mod.transformCopyright) {
      for (let i = 0; i < packagesCompatClone.length; i++) {
        const clonedPackage = packagesCompatClone[i];
        // write the changed copyright back to the original, not the clone
        bucket.packages[i].copyrights = clonedPackage.copyrights
          .map((c) => mod.transformCopyright!(c))
          .filter((c) => c && c.length > 0);
      }
    }
  }
  return text;
}

/**
 * Map a t-a-g package bucket back into the format oss-a-b has previously
 * expected; some tag logic may rely on this.
 */
function bucketPackagesCompat(packages: ProjectPackage[]): any[] {
  return packages.map((p) => ({
    ...p,
    pkg: p,
    usage: p.extra.usage,
  }));
}

/**
 * Glue to allow t-a-g to use our existing license data
 */
export class OverlayLicenseDictionary implements LicenseDictionary {
  get(name: string): NamedLicense | undefined {
    const license = licenses.get(name);
    if (license == undefined) {
      return;
    }

    return {
      name,
      text: license.get('text'),
      tags: license.get('tags').toJS(),
    };
  }
}
