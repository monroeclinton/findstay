/*
  Warnings:

  - You are about to drop the column `latitude` on the `google_maps_location` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `google_maps_location` table. All the data in the column will be lost.
  - Added the required column `coordinate` to the `google_maps_location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "google_maps_location" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "coordinate" geometry(Point, 4326) NOT NULL;
