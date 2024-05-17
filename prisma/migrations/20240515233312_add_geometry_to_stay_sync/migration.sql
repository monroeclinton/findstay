/*
  Warnings:

  - Added the required column `neBBox` to the `stay_sync_params` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neLatitude` to the `stay_sync_params` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neLongitude` to the `stay_sync_params` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swBBox` to the `stay_sync_params` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swLatitude` to the `stay_sync_params` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swLongitude` to the `stay_sync_params` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stay_sync_params" ADD COLUMN     "neBBox" geometry(Point, 4326) NOT NULL,
ADD COLUMN     "neLatitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "neLongitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "swBBox" geometry(Point, 4326) NOT NULL,
ADD COLUMN     "swLatitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "swLongitude" DECIMAL(65,30) NOT NULL;
