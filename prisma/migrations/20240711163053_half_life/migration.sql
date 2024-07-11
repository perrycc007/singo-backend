/*
  Warnings:

  - Added the required column `halfLife` to the `ProgressQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgressQuestion" ADD COLUMN     "halfLife" DOUBLE PRECISION NOT NULL;
