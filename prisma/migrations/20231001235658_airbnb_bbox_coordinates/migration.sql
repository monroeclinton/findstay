/*
  Warnings:

  - Added the required column `neLatitude` to the `airbnb_location_sync` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neLongitude` to the `airbnb_location_sync` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swLatitude` to the `airbnb_location_sync` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swLongitude` to the `airbnb_location_sync` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "airbnb_location_sync" ADD COLUMN     "neLatitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "neLongitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "swLatitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "swLongitude" DECIMAL(65,30) NOT NULL;
