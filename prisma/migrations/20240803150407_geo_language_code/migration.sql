-- CreateTable
CREATE TABLE "geo_language_code" (
    "id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "coordinate" geometry(Point, 4326) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_language_code_pkey" PRIMARY KEY ("id")
);
