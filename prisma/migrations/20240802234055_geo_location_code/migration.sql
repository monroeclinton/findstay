-- CreateTable
CREATE TABLE "GeoLanguageCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "coordinate" geometry(Point, 4326) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoLanguageCode_pkey" PRIMARY KEY ("id")
);
