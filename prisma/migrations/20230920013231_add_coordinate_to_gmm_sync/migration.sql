/*
  Warnings:

  - Added the required column `coordinate` to the `google_maps_sync` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "google_maps_sync" ADD COLUMN     "coordinate" geometry(Point, 4326) NOT NULL;
