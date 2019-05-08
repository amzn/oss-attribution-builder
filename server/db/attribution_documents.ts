// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import pg from './index';

export interface AttributionDocument {
  doc_id: number;
  project_id: string;
  project_version: string;
  created_on: Date;
  created_by: string;
  content: string;
}

export function getAttributionDocument(
  projectId: string,
  docId: number
): Promise<AttributionDocument> {
  return pg().oneOrNone(
    'select * from attribution_documents where project_id = $1 and doc_id = $2',
    [projectId, docId]
  );
}

export function findDocumentsForProject(
  projectId: string
): Promise<
  Array<
    Pick<
      AttributionDocument,
      'doc_id' | 'project_version' | 'created_on' | 'created_by'
    >
  >
> {
  return pg().query(
    'select doc_id, project_version, created_on, created_by from attribution_documents where project_id = $1 order by created_on desc',
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
