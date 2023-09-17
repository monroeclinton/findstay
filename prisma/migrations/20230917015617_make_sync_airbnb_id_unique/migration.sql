/*
  Warnings:

  - A unique constraint covering the columns `[syncId,airbnbId]` on the table `airbnb_location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "airbnb_location_airbnbId_key";

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_location_syncId_airbnbId_key" ON "airbnb_location"("syncId", "airbnbId");
