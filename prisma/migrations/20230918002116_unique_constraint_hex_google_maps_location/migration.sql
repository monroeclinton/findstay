/*
  Warnings:

  - A unique constraint covering the columns `[hex]` on the table `google_maps_location` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "google_maps_location_hex_key" ON "google_maps_location"("hex");
