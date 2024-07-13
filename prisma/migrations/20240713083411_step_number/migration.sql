/*
  Warnings:

  - You are about to drop the `_QuestionToSentence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_QuestionToVocabulary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_QuestionToSentence" DROP CONSTRAINT "_QuestionToSentence_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToSentence" DROP CONSTRAINT "_QuestionToSentence_B_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToVocabulary" DROP CONSTRAINT "_QuestionToVocabulary_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToVocabulary" DROP CONSTRAINT "_QuestionToVocabulary_B_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "sentenceId" INTEGER,
ADD COLUMN     "vocabularyId" INTEGER;

-- DropTable
DROP TABLE "_QuestionToSentence";

-- DropTable
DROP TABLE "_QuestionToVocabulary";

-- CreateTable
CREATE TABLE "_PracticeToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PracticeToQuestion_AB_unique" ON "_PracticeToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_PracticeToQuestion_B_index" ON "_PracticeToQuestion"("B");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToQuestion" ADD CONSTRAINT "_PracticeToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToQuestion" ADD CONSTRAINT "_PracticeToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
