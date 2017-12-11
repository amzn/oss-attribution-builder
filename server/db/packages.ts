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

import pg from './index';

export interface Package {
  package_id: number;
  name: string;
  version: string;
  website?: string;
  license?: string;
  copyright?: string;
  license_text?: string;
  created_by?: string;
  verified: boolean | null;
}

export interface PackageVerify {
  id: number;
  package_id: number;
  verified_on: any;
  verified_by: string;
  comments?: string;
}

export function searchPackages(search: string, limit: number): Promise<Package[]> {
  return pg().query(
    'select distinct on (name, version) * from packages ' +
    'where name ilike $1 order by name, version, package_id desc limit $2',
    [`%${search}%`, limit],
  );
}

export function getLatestPackageRevision(name: string, version: string): Promise<Package> {
  return pg().oneOrNone(
    'select * from packages where name = $1 and version = $2 order by package_id desc limit 1',
    [name, version],
  );
}

export function getPackage(packageId: number): Promise<Package> {
  return pg().oneOrNone('select * from packages where package_id = $1', packageId);
}

export function getPackages(packageIdList: number[]): Promise<Package[]> {
  return pg().query('select * from packages where package_id = any($1)', [packageIdList]);
}

export async function createPackageRevision(name: string, version: string, website: string,
                                            license: string, copyright: string, licenseText: string,
                                            createdBy: string): Promise<number> {
  // normalize some fields
  copyright = copyright.trim();
  if (licenseText != null) {
    licenseText = licenseText.replace(/^[\r\n]+|[\r\n]+$/g, '');
  }

  const result = await pg().one(
    'insert into packages(name, version, website, license, copyright, license_text, created_by) ' +
    'values ($1, $2, $3, $4, $5, $6, $7) returning package_id',
    [name, version, website, license, copyright, licenseText, createdBy],
  );
  return result.package_id;
}

export async function getUnverifiedPackages(limit: number = 25) {
  // take a deep breath
  return pg().any(
    // select all packages,
    'select pkg.package_id, pkg.name, pkg.version, count(pkg.package_id) as count from packages pkg ' +
    // joining against projects using each package by inspecting the JSONB
    // packages_used field (@> is a postgres JSON search operator),
    'join projects pj on pj.packages_used @> ' +
    'json_build_array(json_build_object(\'package_id\', pkg.package_id))::jsonb ' +
    // excluding unverified packages,
    'where verified is null ' +
    // and grouped by package id for the count() in select, which is then sorted.
    'group by pkg.package_id order by count desc, pkg.package_id desc' ,
    [limit],
  );
  // and yes there is an index for the above query (see sql/projects.sql)
}

export async function verifyPackage(packageId: number, verified: boolean | null): Promise<void> {
  await pg().none(
    'update packages set verified = $2 where package_id = $1',
    [packageId, verified],
  );
}

export async function getPackageVerifications(packageId: number): Promise<PackageVerify[]> {
  return pg().any(
    'select * from packages_verify where package_id = $1 order by verified_on desc',
    [packageId],
  );
}

export async function addVerification(packageId, verifiedBy, comments): Promise<number> {
  const result = await pg().one(
    'insert into packages_verify(package_id, verified_by, comments) values ($1, $2, $3) returning id',
    [packageId, verifiedBy, comments],
  );
  return result.id;
}
