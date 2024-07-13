/*
  Warnings:

  - You are about to drop the column `completedExercises` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `progressStepId` on the `ProgressQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `PracticeNumber` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `stepId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Level` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Practice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgressStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Step` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PracticeToQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProgressToReview` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currentPractice` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progressId` to the `ProgressQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `practiceNumber` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `songId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `step` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Level" DROP CONSTRAINT "Level_songId_fkey";

-- DropForeignKey
ALTER TABLE "Practice" DROP CONSTRAINT "Practice_stepId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressQuestion" DROP CONSTRAINT "ProgressQuestion_progressStepId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressStep" DROP CONSTRAINT "ProgressStep_progressId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressStep" DROP CONSTRAINT "ProgressStep_stepId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_stepId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_songId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_levelId_fkey";

-- DropForeignKey
ALTER TABLE "_PracticeToQuestion" DROP CONSTRAINT "_PracticeToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_PracticeToQuestion" DROP CONSTRAINT "_PracticeToQuestion_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProgressToReview" DROP CONSTRAINT "_ProgressToReview_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProgressToReview" DROP CONSTRAINT "_ProgressToReview_B_fkey";

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "completedExercises",
ADD COLUMN     "currentPractice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProgressQuestion" DROP COLUMN "progressStepId",
ADD COLUMN     "progressId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "PracticeNumber",
DROP COLUMN "stepId",
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "practiceNumber" INTEGER NOT NULL,
ADD COLUMN     "songId" INTEGER NOT NULL,
ADD COLUMN     "step" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Level";

-- DropTable
DROP TABLE "Practice";

-- DropTable
DROP TABLE "ProgressStep";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "Step";

-- DropTable
DROP TABLE "_PracticeToQuestion";

-- DropTable
DROP TABLE "_ProgressToReview";

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressQuestion" ADD CONSTRAINT "ProgressQuestion_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "Progress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
