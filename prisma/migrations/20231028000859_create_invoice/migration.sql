-- CreateTable
CREATE TABLE "billing_invoice" (
    "id" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoice_txId_key" ON "billing_invoice"("txId");
