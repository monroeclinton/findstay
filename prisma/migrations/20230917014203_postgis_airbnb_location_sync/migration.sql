/*
  Warnings:

  - Added the required column `neBBox` to the `airbnb_location_sync` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swBBox` to the `airbnb_location_sync` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "airbnb_location_sync" ADD COLUMN     "neBBox" geometry(Point, 4326) NOT NULL,
ADD COLUMN     "swBBox" geometry(Point, 4326) NOT NULL;

-- CreateIndex
CREATE INDEX "airbnb_location_sync_neBBox_idx" ON "airbnb_location_sync" USING GIST ("neBBox");

-- CreateIndex
CREATE INDEX "airbnb_location_sync_swBBox_idx" ON "airbnb_location_sync" USING GIST ("swBBox");
