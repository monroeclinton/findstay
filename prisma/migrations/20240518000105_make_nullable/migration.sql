-- AlterTable
ALTER TABLE "stay_sync_params" ALTER COLUMN "stayMaxPrice" DROP NOT NULL,
ALTER COLUMN "poiMinRating" DROP NOT NULL,
ALTER COLUMN "poiMinReviews" DROP NOT NULL;
