-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_url_key" ON "Invoice"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_txId_key" ON "Invoice"("txId");
