-- Ensure seed system admin exists when no SYSTEM_ADMIN row is present.
-- Idempotent: does nothing if a SYSTEM_ADMIN already exists.
UPDATE "User"
SET role = 'SYSTEM_ADMIN'
WHERE email = 'admin@alzaad.org'
  AND role = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM "User" WHERE role = 'SYSTEM_ADMIN'
  );
