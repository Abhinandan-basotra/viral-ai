/*
  Warnings:

  - You are about to drop the `RenderQueue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Audio" DROP CONSTRAINT "Audio_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Audio" DROP CONSTRAINT "Audio_sceneId_fkey";

-- DropForeignKey
ALTER TABLE "RenderQueue" DROP CONSTRAINT "RenderQueue_projectId_fkey";

-- DropForeignKey
ALTER TABLE "RenderQueue" DROP CONSTRAINT "RenderQueue_sceneId_fkey";

-- DropForeignKey
ALTER TABLE "Scene" DROP CONSTRAINT "Scene_projectId_fkey";

-- DropTable
DROP TABLE "RenderQueue";

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
