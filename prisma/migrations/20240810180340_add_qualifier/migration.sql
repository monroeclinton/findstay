/*
  Warnings:

  - A unique constraint covering the columns `[locationId,checkin,checkout,qualifier]` on the table `airbnb_location_price` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `qualifier` to the `airbnb_location_price` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "airbnb_location_price_locationId_checkin_checkout_key";

-- AlterTable
ALTER TABLE "airbnb_location_price" ADD COLUMN     "qualifier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_location_price_locationId_checkin_checkout_qualifier_key" ON "airbnb_location_price"("locationId", "checkin", "checkout", "qualifier");
