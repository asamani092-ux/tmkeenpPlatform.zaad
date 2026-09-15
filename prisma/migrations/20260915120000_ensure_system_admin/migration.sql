-- Promote seed admin after SYSTEM_ADMIN enum value is committed.
-- Idempotent: no-op when a SYSTEM_ADMIN row already exists.
UPDATE "User"
SET role = 'SYSTEM_ADMIN'
WHERE email = 'admin@alzaad.org'
  AND role = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM "User" WHERE role = 'SYSTEM_ADMIN'
  );
