/*
  Warnings:

  - You are about to drop the `AirbnbApi` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "airbnb_location_sync" ADD COLUMN     "priceMax" INTEGER;

-- DropTable
DROP TABLE "AirbnbApi";

-- CreateTable
CREATE TABLE "airbnb_api" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airbnb_api_pkey" PRIMARY KEY ("id")
);
