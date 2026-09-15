-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SYSTEM_ADMIN';

-- Promote legacy seed admin to system admin (single account)
UPDATE "User" SET role = 'SYSTEM_ADMIN' WHERE email = 'admin@alzaad.org' AND role = 'ADMIN';
