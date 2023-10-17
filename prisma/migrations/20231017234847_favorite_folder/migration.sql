/*
  Warnings:

  - Added the required column `folderId` to the `airbnb_location_favorite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "airbnb_location_favorite" ADD COLUMN     "folderId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "airbnb_location_favorite_folder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "airbnb_location_favorite_folder_pkey" PRIMARY KEY ("id")
);
