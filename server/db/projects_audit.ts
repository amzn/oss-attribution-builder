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

export async function getProjectAuditLog(projectId: string) {
  return pg().query(
    'select * from projects_audit where project_id = $1 order by changed_on desc',
    [projectId],
  );
}

export async function addAuditItem(projectId: string, who: string, changes: any): Promise<void> {
  await pg().none(
    'insert into projects_audit(project_id, who, changed_to) values($1, $2, $3)',
    [projectId, who, changes],
  );
}
