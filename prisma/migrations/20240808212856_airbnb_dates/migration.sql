-- AlterTable
ALTER TABLE "airbnb_location_sync" ADD COLUMN     "checkin" TIMESTAMP(3),
ADD COLUMN     "checkout" TIMESTAMP(3),
ADD COLUMN     "flexibleDate" INTEGER;
