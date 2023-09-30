/*
  Warnings:

  - Added the required column `price` to the `airbnb_location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "airbnb_location" ADD COLUMN     "price" INTEGER NOT NULL;
