-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "songId" INTEGER NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sentence" (
    "id" SERIAL NOT NULL,
    "line" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "songId" INTEGER NOT NULL,

    CONSTRAINT "Sentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "sentenceId" INTEGER NOT NULL,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestionToSentence" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_QuestionToVocabulary" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProgressToReview" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionToSentence_AB_unique" ON "_QuestionToSentence"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionToSentence_B_index" ON "_QuestionToSentence"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionToVocabulary_AB_unique" ON "_QuestionToVocabulary"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionToVocabulary_B_index" ON "_QuestionToVocabulary"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProgressToReview_AB_unique" ON "_ProgressToReview"("A", "B");

-- CreateIndex
CREATE INDEX "_ProgressToReview_B_index" ON "_ProgressToReview"("B");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToSentence" ADD CONSTRAINT "_QuestionToSentence_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToSentence" ADD CONSTRAINT "_QuestionToSentence_B_fkey" FOREIGN KEY ("B") REFERENCES "Sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToVocabulary" ADD CONSTRAINT "_QuestionToVocabulary_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToVocabulary" ADD CONSTRAINT "_QuestionToVocabulary_B_fkey" FOREIGN KEY ("B") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgressToReview" ADD CONSTRAINT "_ProgressToReview_A_fkey" FOREIGN KEY ("A") REFERENCES "Progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgressToReview" ADD CONSTRAINT "_ProgressToReview_B_fkey" FOREIGN KEY ("B") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
