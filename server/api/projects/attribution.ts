// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as db from '../../db/projects';
import * as packagedb from '../../db/packages';
import DocBuilder from '../../licenses/docbuilder';

export async function addProjectPackages(project: db.DbProject, builder: DocBuilder) {
  // optimization: fetch all package ids at once, then organize into a map
  const packageIds = project.packages_used.map(usage => usage.package_id);
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
    const pkg = packages.get(usage.package_id);
    if (pkg == undefined) {
      throw new Error(`Reference to package ${usage.package_id} was not found`);
    }
    builder.addPackage(pkg, usage);
  }
}
