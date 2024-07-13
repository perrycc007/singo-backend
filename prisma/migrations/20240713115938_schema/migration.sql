/*
  Warnings:

  - You are about to drop the column `accuracy` on the `ProgressQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `progressId` on the `ProgressQuestion` table. All the data in the column will be lost.
  - Added the required column `wrongFrequency` to the `ProgressQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProgressQuestion" DROP CONSTRAINT "ProgressQuestion_progressId_fkey";

-- AlterTable
ALTER TABLE "ProgressQuestion" DROP COLUMN "accuracy",
DROP COLUMN "progressId",
ADD COLUMN     "wrongFrequency" DOUBLE PRECISION NOT NULL;
