/*
  Warnings:

  - Made the column `checkin` on table `airbnb_location_price` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkout` on table `airbnb_location_price` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkin` on table `airbnb_location_sync` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkout` on table `airbnb_location_sync` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkin` on table `stay_sync_params` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkout` on table `stay_sync_params` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "airbnb_location_price" ALTER COLUMN "checkin" SET NOT NULL,
ALTER COLUMN "checkout" SET NOT NULL;

-- AlterTable
ALTER TABLE "airbnb_location_sync" ALTER COLUMN "checkin" SET NOT NULL,
ALTER COLUMN "checkout" SET NOT NULL;

-- AlterTable
ALTER TABLE "stay_sync_params" ALTER COLUMN "checkin" SET NOT NULL,
ALTER COLUMN "checkout" SET NOT NULL;
