/*
  Warnings:

  - You are about to drop the column `syncId` on the `airbnb_location` table. All the data in the column will be lost.
  - You are about to drop the column `page` on the `airbnb_location_sync` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[airbnbId]` on the table `airbnb_location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "airbnb_location_syncId_airbnbId_key";

-- AlterTable
ALTER TABLE "airbnb_location" DROP COLUMN "syncId";

-- AlterTable
ALTER TABLE "airbnb_location_sync" DROP COLUMN "page";

-- CreateTable
CREATE TABLE "airbnb_location_sync_page" (
    "id" TEXT NOT NULL,
    "cursor" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airbnb_location_sync_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airbnb_locations_on_pages" (
    "locationId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,

    CONSTRAINT "airbnb_locations_on_pages_pkey" PRIMARY KEY ("locationId","pageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_location_airbnbId_key" ON "airbnb_location"("airbnbId");
