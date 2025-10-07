/*
  Warnings:

  - You are about to drop the column `pitch` on the `Audio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Audio" DROP COLUMN "pitch",
ADD COLUMN     "voice_similarity_boost" DOUBLE PRECISION,
ADD COLUMN     "voice_stability" DOUBLE PRECISION;
