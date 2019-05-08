CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS projects
(
  project_id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  planned_release TIMESTAMP WITH TIME ZONE,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  contacts JSONB,
  acl JSONB,
  packages_used JSONB NOT NULL,
  refs JSONB NOT NULL DEFAULT '{}',
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS projects_packages_used_gin ON projects USING GIN (packages_used jsonb_path_ops);
CREATE INDEX IF NOT EXISTS projects_refs_gin ON projects USING GIN (refs);

CREATE TABLE IF NOT EXISTS attribution_documents
(
  doc_id SERIAL PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  project_version TEXT NOT NULL,
  content TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_by TEXT NOT NULL,
  CONSTRAINT attribution_documents_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES projects (project_id)
);

CREATE TABLE IF NOT EXISTS packages
(
  package_id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  website TEXT,
  license TEXT,
  copyright TEXT,
  license_text TEXT,
  created_by TEXT,
  verified BOOLEAN -- null: unverified, true: verified good, false: verified bad
);
CREATE INDEX IF NOT EXISTS packages_name_version_package_id_index ON packages USING BTREE (name, version, package_id);
CREATE INDEX IF NOT EXISTS packages_name_version_tsv_index ON packages USING GIN (to_tsvector('english', name || ' ' || version));

CREATE TABLE IF NOT EXISTS packages_verify
(
  id SERIAL PRIMARY KEY NOT NULL,
  package_id INTEGER NOT NULL,
  verified_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  verified_by TEXT NOT NULL,
  comments TEXT,
  CONSTRAINT packages_verify_packages_package_id_fk FOREIGN KEY (package_id) REFERENCES packages (package_id)
);
CREATE INDEX IF NOT EXISTS packages_verify_package_id_index ON packages_verify (package_id);

CREATE TABLE IF NOT EXISTS projects_audit
(
  id SERIAL PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  who TEXT NOT NULL,
  changed_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  changed_to JSONB NOT NULL,
  CONSTRAINT project_audit_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES projects (project_id)
);
