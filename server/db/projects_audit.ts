// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import pg from './index';

export async function getProjectAuditLog(projectId: string) {
  return pg().query(
    'select * from projects_audit where project_id = $1 order by changed_on desc',
    [projectId]
  );
}

export async function addAuditItem(
  projectId: string,
  who: string,
  changes: any
): Promise<void> {
  await pg().none(
    'insert into projects_audit(project_id, who, changed_to) values($1, $2, $3)',
    [projectId, who, changes]
  );
}
