-- CreateTable
CREATE TABLE "airbnb_location_favorite" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "airbnb_location_favorite_pkey" PRIMARY KEY ("id")
);
