// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import pg from './index';

export interface AttributionDocument {
  doc_id: number;
  project_id: string;
  created_on: Date;
  content: string;
}

export function getAttributionDocument(
  docId: number
): Promise<AttributionDocument> {
  return pg().oneOrNone(
    'select * from attribution_documents where doc_id = $1',
    [docId]
  );
}

export function findDocumentsForProject(
  projectId: string
): Promise<AttributionDocument> {
  return pg().query(
    'select * from attribution_documents where project_id = $1 order by created_on desc',
    [projectId]
  );
}

export async function storeAttributionDocument(
  projectId: string,
  projectVersion: string,
  content: string,
  createdBy: string
): Promise<number> {
  const doc = await pg().one(
    'insert into attribution_documents(project_id, project_version, content, created_by) ' +
      'values ($1, $2, $3, $4) returning doc_id',
    [projectId, projectVersion, content, createdBy]
  );
  return doc.doc_id;
}
