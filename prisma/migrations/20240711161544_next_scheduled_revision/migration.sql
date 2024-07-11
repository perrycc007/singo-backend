/*
  Warnings:

  - Added the required column `nextScheduledRevision` to the `ProgressQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgressQuestion" ADD COLUMN     "nextScheduledRevision" TIMESTAMP(3) NOT NULL;
