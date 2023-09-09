-- CreateTable
CREATE TABLE "GoogleMapsLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "syncId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reviews" INTEGER NOT NULL,
    "stars" DECIMAL NOT NULL,
    "hex" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "latitude" DECIMAL NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GoogleMapsSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "search" TEXT NOT NULL,
    "latitude" DECIMAL NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
