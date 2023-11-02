-- CreateTable
CREATE TABLE "nominatim_search" (
    "id" TEXT NOT NULL,
    "search" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "neLatitude" DECIMAL(65,30) NOT NULL,
    "neLongitude" DECIMAL(65,30) NOT NULL,
    "swLatitude" DECIMAL(65,30) NOT NULL,
    "swLongitude" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nominatim_search_pkey" PRIMARY KEY ("id")
);
