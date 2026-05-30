-- BrandBlitz PostgreSQL bootstrap.
-- Fresh installs load the baseline schema, then the forward migrations.
-- The files are included relative to this script so `psql -f init.sql` works
-- both in CI and in the Postgres container used by docker-compose.

\ir apps/api/migrations/00000-initial.sql
\ir apps/api/migrations/00001-hot-path-indexes.sql

