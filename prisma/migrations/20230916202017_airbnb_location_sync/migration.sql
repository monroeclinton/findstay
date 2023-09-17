/*
  Warnings:

  - You are about to drop the column `link` on the `airbnb_location` table. All the data in the column will be lost.
  - Added the required column `syncId` to the `airbnb_location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "airbnb_location" DROP COLUMN "link",
ADD COLUMN     "syncId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "airbnb_location_sync" (
    "id" TEXT NOT NULL,
    "search" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "cursors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airbnb_location_sync_pkey" PRIMARY KEY ("id")
);
