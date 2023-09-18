/*
  Warnings:

  - Added the required column `latitude` to the `google_maps_location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `google_maps_location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "google_maps_location" ADD COLUMN     "latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "longitude" DECIMAL(65,30) NOT NULL;
