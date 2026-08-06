-- PDF attachments in PostgreSQL (survive container redeploy)

CREATE TABLE "stored_files" (
    "id" TEXT NOT NULL,
    "subdir" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stored_files_subdir_filename_key" ON "stored_files"("subdir", "filename");

CREATE INDEX "stored_files_subdir_idx" ON "stored_files"("subdir");
