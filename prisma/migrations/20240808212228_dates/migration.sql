-- AlterTable
ALTER TABLE "stay_sync_params" ADD COLUMN     "checkin" TIMESTAMP(3),
ADD COLUMN     "checkout" TIMESTAMP(3),
ADD COLUMN     "flexibleDate" INTEGER;
