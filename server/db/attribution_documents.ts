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

export interface AttributionDocument {
  doc_id: number;
  project_id: string;
  created_on: Date;
  content: string;
}

export function getAttributionDocument(docId: number): Promise<AttributionDocument> {
  return pg().oneOrNone('select * from attribution_documents where doc_id = $1', [docId]);
}

export function findDocumentsForProject(projectId: string): Promise<AttributionDocument> {
  return pg().query(
    'select * from attribution_documents where project_id = $1 order by created_on desc',
    [projectId],
  );
}

export async function storeAttributionDocument(projectId: string, projectVersion: string,
                                               content: string, createdBy: string):
                                               Promise<number> {
  const doc = await pg().one(
    'insert into attribution_documents(project_id, project_version, content, created_by) ' +
    'values ($1, $2, $3, $4) returning doc_id',
    [projectId, projectVersion, content, createdBy],
  );
  return doc.doc_id;
}
