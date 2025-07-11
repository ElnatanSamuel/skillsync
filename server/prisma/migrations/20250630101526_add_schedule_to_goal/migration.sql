-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "frequency" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCompleted" TIMESTAMP(3),
ADD COLUMN     "nextDueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "note" TEXT NOT NULL DEFAULT '';
