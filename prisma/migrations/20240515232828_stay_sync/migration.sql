-- CreateTable
CREATE TABLE "stay_sync" (
    "id" TEXT NOT NULL,
    "airbnbSyncId" TEXT NOT NULL,
    "paramsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stay_sync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stay_sync_params" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "stayMaxPrice" TEXT NOT NULL,
    "poiMinRating" TEXT NOT NULL,
    "poiMinReviews" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stay_sync_params_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stay_sync_paramsId_key" ON "stay_sync"("paramsId");
