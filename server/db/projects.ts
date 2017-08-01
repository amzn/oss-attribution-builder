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
  contacts: {[key: string]: string[]};
  // resource (user/group) name: access level
  acl: {[key: string]: string};
  packages_used: any[];
  metadata?: object;
}

export function getProject(projectId: string): Promise<DbProject> {
  return pg().oneOrNone('select * from projects where project_id = $1', projectId);
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
    [groups],
  );
}

type ProjectInput = Pick<DbProject, 'title' | 'version' | 'description' | 'planned_release' |
                                    'contacts' | 'acl' | 'metadata'>;
export async function createProject(project: ProjectInput, who: string): Promise<string> {
  const projectId = generateID(10);

  // add the entry itself
  await pg().none(
    'insert into projects(project_id, title, version, description, planned_release, contacts, acl, metadata, packages_used) values($1, $2, $3, $4, $5, $6, $7, $8, \'[]\'::jsonb)',
    [projectId, project.title, project.version, project.description, project.planned_release, project.contacts, project.acl, project.metadata],
  );

  // add auditing info
  await addAuditItem(projectId, who, {
    ...project,
    project_id: projectId,
  });
  return projectId;
}

export async function patchProject(projectId: string, changes: Partial<DbProject>,
                                   who: string): Promise<void> {
  // build a set up update statements
  const patches = [];
  for (const change of Object.keys(changes)) {
    // make a named parameter with the same name as the field
    patches.push(`${change} = $(${change})`);
  }
  const patchStr = patches.join(' ');

  // insert them all
  await pg().none(`update projects set ${patchStr} where project_id = $(projectId)`, Object.assign({projectId}, changes));

  // audit the change
  await addAuditItem(projectId, who, changes);
}

export async function updatePackagesUsed(projectId: string, packagesUsed: any, who: string): Promise<void> {
  await pg().none(
    'update projects set packages_used = $1 where project_id = $2',
    [JSON.stringify(packagesUsed), projectId],
  );

  await addAuditItem(projectId, who, {
    packages_used: packagesUsed,
  });
}
