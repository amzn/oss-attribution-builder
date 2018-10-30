// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import generateID from '../util/idgen';
import pg from './index';
import { addAuditItem } from './projects_audit';

export interface DbProject {
  project_id: string;
  title: string;
  version: string;
  description?: string;
  planned_release?: Date;
  created_on: Date;
  // contact type: [list of contacts]
  contacts: { [type: string]: string[] };
  // resource (user/group) name: access level
  acl: { [resource: string]: AccessLevel };
  packages_used: DbPackageUsage[];
  refs: { [projectId: string]: DbProjectRef };
  metadata?: { [key: string]: any };
}

export interface DbPackageUsage {
  package_id: number;
  [key: string]: any;
}

export interface DbProjectRef {
  type: 'cloned_from' | 'related' | 'includes';
  [key: string]: any;
}

export type AccessLevel = 'owner' | 'editor' | 'viewer';

export function getProject(projectId: string): Promise<DbProject | undefined> {
  return pg().oneOrNone(
    'select * from projects where project_id = $1',
    projectId
  );
}

export function searchProjects(): Promise<DbProject[]> {
  return pg().query('select * from projects order by created_on desc');
}

export function searchOwnProjects(groups: string[]): Promise<DbProject[]> {
  if (groups.length === 0) {
    return Promise.resolve([]);
  }
  return pg().query(
    'select * from projects where acl ?| $1 order by created_on desc',
    [groups]
  );
}

type ProjectInput = Pick<
  DbProject,
  | 'title'
  | 'version'
  | 'description'
  | 'planned_release'
  | 'contacts'
  | 'acl'
  | 'refs'
  | 'metadata'
>;
export async function createProject(
  project: ProjectInput,
  who: string
): Promise<string> {
  const projectId = generateID(10);

  // add the entry itself
  await pg().none(
    'insert into projects(' +
      'project_id, title, version, description, planned_release, contacts, acl, refs, metadata, packages_used' +
      ") values($1, $2, $3, $4, $5, $6, $7, $8, $9, '[]'::jsonb)",
    [
      projectId,
      project.title,
      project.version,
      project.description,
      project.planned_release,
      project.contacts,
      project.acl,
      project.refs,
      project.metadata,
    ]
  );

  // add auditing info
  await addAuditItem(projectId, who, {
    ...project,
    project_id: projectId,
  });
  return projectId;
}

export async function patchProject(
  projectId: string,
  changes: Partial<DbProject>,
  who: string
): Promise<void> {
  // build a set up update statements
  const patches: string[] = [];
  for (const change of Object.keys(changes)) {
    // make a named parameter with the same name as the field
    patches.push(`${change} = $(${change})`);
  }
  const patchStr = patches.join(' ');

  // insert them all
  await pg().none(
    `update projects set ${patchStr} where project_id = $(projectId)`,
    Object.assign({ projectId }, changes)
  );

  // audit the change
  await addAuditItem(projectId, who, changes);
}

export async function updatePackagesUsed(
  projectId: string,
  packagesUsed: any,
  who: string
): Promise<void> {
  await pg().none(
    'update projects set packages_used = $1 where project_id = $2',
    [JSON.stringify(packagesUsed), projectId]
  );

  await addAuditItem(projectId, who, {
    packages_used: packagesUsed,
  });
}

export async function getProjectRefs(
  projectIds: string[]
): Promise<
  Array<Pick<DbProject, 'project_id' | 'title' | 'version' | 'packages_used'>>
> {
  return await pg().query(
    'select project_id, title, version, packages_used from projects where project_id = any($1)',
    [projectIds]
  );
}

export async function getProjectsRefReverse(
  projectId: string
): Promise<Array<Pick<DbProject, 'project_id' | 'title' | 'version'>>> {
  return await pg().query(
    'select project_id, title, version from projects where refs ? $1',
    [projectId]
  );
}
