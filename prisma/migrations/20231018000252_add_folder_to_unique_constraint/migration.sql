/*
  Warnings:

  - A unique constraint covering the columns `[locationId,userId,folderId]` on the table `airbnb_location_favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "airbnb_location_favorite_locationId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_location_favorite_locationId_userId_folderId_key" ON "airbnb_location_favorite"("locationId", "userId", "folderId");
