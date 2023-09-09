-- CreateTable
CREATE TABLE "GoogleMapsLocation" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reviews" INTEGER NOT NULL,
    "stars" DECIMAL(65,30) NOT NULL,
    "hex" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleMapsLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleMapsSync" (
    "id" TEXT NOT NULL,
    "search" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleMapsSync_pkey" PRIMARY KEY ("id")
);
