-- AlterEnum only. PostgreSQL cannot use a newly added enum value in the
-- same transaction as ADD VALUE (Prisma wraps each migration in a txn).
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
