/*
  Warnings:

  - You are about to drop the column `duration` on the `Scene` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `Scene` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Scene` table. All the data in the column will be lost.
  - You are about to drop the column `visualPrompt` on the `Scene` table. All the data in the column will be lost.
  - Added the required column `description` to the `Scene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Scene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Scene` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scene" DROP COLUMN "duration",
DROP COLUMN "keywords",
DROP COLUMN "text",
DROP COLUMN "visualPrompt",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endTime" INTEGER NOT NULL,
ADD COLUMN     "startTime" INTEGER NOT NULL;
