-- CreateTable
CREATE TABLE "organizations" (
    "organization_id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "departments" (
    "department_id" VARCHAR(50) NOT NULL,
    "organization_id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "file_path" TEXT,
    "file_size" BIGINT,
    "file_type" VARCHAR(100),
    "status" VARCHAR(50),
    "organization_id" VARCHAR(50),
    "department_id" VARCHAR(50),
    "uploaded_by_id" VARCHAR(50),
    "is_validated_by_human" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "analytics_id" VARCHAR(50),
    "original_file_name" VARCHAR(255),
    "template_name" VARCHAR(100),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "document_id" VARCHAR(50) NOT NULL,
    "vendor_name" VARCHAR(255),
    "vendor_party_number" VARCHAR(50),
    "vendor_address" TEXT,
    "vendor_tax_id" VARCHAR(50),
    "confidence_name" DECIMAL(5,2),
    "confidence_address" DECIMAL(5,2),
    "confidence_tax_id" DECIMAL(5,2),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "document_id" VARCHAR(50) NOT NULL,
    "customer_name" VARCHAR(255),
    "customer_address" TEXT,
    "confidence_name" DECIMAL(5,2),
    "confidence_address" DECIMAL(5,2),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "document_id" VARCHAR(50) NOT NULL,
    "invoice_id" VARCHAR(100),
    "invoice_date" DATE,
    "delivery_date" DATE,
    "confidence_invoice_id" DECIMAL(5,2),
    "confidence_invoice_date" DECIMAL(5,2),
    "confidence_delivery_date" DECIMAL(5,2),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "document_id" VARCHAR(50) NOT NULL,
    "due_date" DATE,
    "payment_terms" TEXT,
    "bank_account_number" VARCHAR(50),
    "bic" VARCHAR(20),
    "account_name" VARCHAR(255),
    "net_days" INTEGER,
    "discount_percentage" VARCHAR(10),
    "discount_days" INTEGER,
    "discount_due_date" DATE,
    "discounted_total" DECIMAL(15,2),
    "confidence_payment_terms" DECIMAL(5,2),
    "confidence_bank_account" DECIMAL(5,2),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summaries" (
    "id" SERIAL NOT NULL,
    "document_id" VARCHAR(50) NOT NULL,
    "document_type" VARCHAR(50),
    "sub_total" DECIMAL(15,2),
    "total_tax" DECIMAL(15,2),
    "invoice_total" DECIMAL(15,2),
    "currency_symbol" VARCHAR(10),
    "confidence_sub_total" DECIMAL(5,2),
    "confidence_total_tax" DECIMAL(5,2),
    "confidence_invoice_total" DECIMAL(5,2),

    CONSTRAINT "summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_items" (
    "id" SERIAL NOT NULL,
    "document_id" VARCHAR(50) NOT NULL,
    "sr_no" INTEGER,
    "description" TEXT,
    "quantity" DECIMAL(15,2),
    "unit_price" DECIMAL(15,2),
    "total_price" DECIMAL(15,2),
    "sachkonto" VARCHAR(50),
    "bu_schluessel" VARCHAR(50),
    "vat_rate" DECIMAL(5,2),
    "vat_amount" DECIMAL(15,2),
    "confidence_description" DECIMAL(5,2),
    "confidence_quantity" DECIMAL(5,2),
    "confidence_unit_price" DECIMAL(5,2),
    "confidence_total_price" DECIMAL(5,2),

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_documents_org" ON "documents"("organization_id");

-- CreateIndex
CREATE INDEX "idx_documents_dept" ON "documents"("department_id");

-- CreateIndex
CREATE INDEX "idx_documents_status" ON "documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_document_id_key" ON "vendors"("document_id");

-- CreateIndex
CREATE INDEX "idx_vendors_doc" ON "vendors"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_document_id_key" ON "customers"("document_id");

-- CreateIndex
CREATE INDEX "idx_customers_doc" ON "customers"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_document_id_key" ON "invoices"("document_id");

-- CreateIndex
CREATE INDEX "idx_invoices_doc" ON "invoices"("document_id");

-- CreateIndex
CREATE INDEX "idx_invoices_date" ON "invoices"("invoice_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_document_id_key" ON "payments"("document_id");

-- CreateIndex
CREATE INDEX "idx_payments_doc" ON "payments"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "summaries_document_id_key" ON "summaries"("document_id");

-- CreateIndex
CREATE INDEX "idx_summaries_doc" ON "summaries"("document_id");

-- CreateIndex
CREATE INDEX "idx_line_items_doc" ON "line_items"("document_id");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("organization_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
