/*
  Warnings:

  - The `rating` column on the `airbnb_location` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "airbnb_location" DROP COLUMN "rating",
ADD COLUMN     "rating" DECIMAL(65,30);
