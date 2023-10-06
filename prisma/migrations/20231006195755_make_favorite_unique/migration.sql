/*
  Warnings:

  - A unique constraint covering the columns `[locationId,userId]` on the table `airbnb_location_favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "airbnb_location_favorite_locationId_userId_key" ON "airbnb_location_favorite"("locationId", "userId");
