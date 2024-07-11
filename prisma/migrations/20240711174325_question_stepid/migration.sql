/*
  Warnings:

  - You are about to drop the column `practiceId` on the `Question` table. All the data in the column will be lost.
  - Added the required column `stepId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_practiceId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "practiceId",
ADD COLUMN     "stepId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
