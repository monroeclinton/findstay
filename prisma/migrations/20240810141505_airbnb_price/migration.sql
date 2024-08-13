/*
  Warnings:

  - You are about to drop the column `price` on the `airbnb_location` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "airbnb_location" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "airbnb_location_price" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "checkin" TIMESTAMP(3),
    "checkout" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airbnb_location_price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_location_price_locationId_checkin_checkout_key" ON "airbnb_location_price"("locationId", "checkin", "checkout");
