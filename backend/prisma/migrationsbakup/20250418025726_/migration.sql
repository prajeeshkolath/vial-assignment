/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `form` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "source_record" DROP CONSTRAINT "source_record_form_id_fkey";

-- AlterTable
ALTER TABLE "source_data" ADD CONSTRAINT "source_data_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "form_name_key" ON "form"("name");

-- CreateIndex
CREATE INDEX "source_data_source_record_id_idx" ON "source_data"("source_record_id");

-- CreateIndex
CREATE INDEX "source_record_form_id_idx" ON "source_record"("form_id");
