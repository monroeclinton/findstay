/*
  Warnings:

  - A unique constraint covering the columns `[locationId,checkin,checkout]` on the table `airbnb_location_price` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "airbnb_location_price_locationId_checkin_checkout_qualifier_key";

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_location_price_locationId_checkin_checkout_key" ON "airbnb_location_price"("locationId", "checkin", "checkout");
