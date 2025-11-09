// ingest.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

class InvoiceDataIngestion {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Helper: Parse MongoDB date format
  parseDate(dateObj) {
    if (!dateObj) return null;
    if (typeof dateObj === 'object' && dateObj.$date) {
      return new Date(dateObj.$date);
    }
    if (typeof dateObj === 'string') {
      const date = new Date(dateObj);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  // Helper: Extract value from nested object
  getValue(obj, defaultValue = null) {
    if (obj && typeof obj === 'object' && 'value' in obj) {
      return obj.value ?? defaultValue;
    }
    return defaultValue;
  }

  // Helper: Extract confidence score
  getConfidence(obj) {
    if (obj && typeof obj === 'object' && 'confidence' in obj) {
      const confidence = parseFloat(obj.confidence);
      return isNaN(confidence) ? null : confidence;
    }
    return null;
  }

  // Helper: Parse file size
  parseFileSize(fileSize) {
    if (!fileSize) return null;
    if (typeof fileSize === 'object' && fileSize.$numberLong) {
      return BigInt(fileSize.$numberLong);
    }
    if (typeof fileSize === 'number') {
      return BigInt(fileSize);
    }
    return null;
  }

  // Process single document
  async processDocument(doc) {
    const docId = doc._id;
    const orgId = doc.organizationId;
    const deptId = doc.departmentId;

    // Upsert organization
    if (orgId) {
      await this.prisma.organization.upsert({
        where: { id: orgId },
        update: {},
        create: { id: orgId },
      });
    }

    // Upsert department
    if (deptId && orgId) {
      await this.prisma.department.upsert({
        where: { id: deptId },
        update: {},
        create: {
          id: deptId,
          organizationId: orgId,
        },
      });
    }

    // Upsert document
    await this.prisma.document.upsert({
      where: { id: docId },
      update: {
        name: doc.name,
        filePath: doc.filePath,
        fileSize: this.parseFileSize(doc.fileSize),
        fileType: doc.fileType,
        status: doc.status,
        organizationId: orgId,
        departmentId: deptId,
        uploadedById: doc.uploadedById,
        isValidatedByHuman: doc.isValidatedByHuman ?? false,
        updatedAt: this.parseDate(doc.updatedAt),
        processedAt: this.parseDate(doc.processedAt),
        analyticsId: doc.analyticsId,
        originalFileName: doc.metadata?.originalFileName,
        templateName: doc.metadata?.templateName,
      },
      create: {
        id: docId,
        name: doc.name,
        filePath: doc.filePath,
        fileSize: this.parseFileSize(doc.fileSize),
        fileType: doc.fileType,
        status: doc.status,
        organizationId: orgId,
        departmentId: deptId,
        uploadedById: doc.uploadedById,
        isValidatedByHuman: doc.isValidatedByHuman ?? false,
        createdAt: this.parseDate(doc.createdAt),
        updatedAt: this.parseDate(doc.updatedAt),
        processedAt: this.parseDate(doc.processedAt),
        analyticsId: doc.analyticsId,
        originalFileName: doc.metadata?.originalFileName,
        templateName: doc.metadata?.templateName,
      },
    });

    // Process extracted data
    const extracted = doc.extractedData?.llmData;
    if (!extracted) return;

    // Insert vendor
    if (extracted.vendor?.value) {
      const v = extracted.vendor.value;
      await this.prisma.vendor.upsert({
        where: { documentId: docId },
        update: {
          vendorName: this.getValue(v.vendorName),
          vendorPartyNumber: this.getValue(v.vendorPartyNumber),
          vendorAddress: this.getValue(v.vendorAddress),
          vendorTaxId: this.getValue(v.vendorTaxId),
          confidenceName: this.getConfidence(v.vendorName),
          confidenceAddress: this.getConfidence(v.vendorAddress),
          confidenceTaxId: this.getConfidence(v.vendorTaxId),
        },
        create: {
          documentId: docId,
          vendorName: this.getValue(v.vendorName),
          vendorPartyNumber: this.getValue(v.vendorPartyNumber),
          vendorAddress: this.getValue(v.vendorAddress),
          vendorTaxId: this.getValue(v.vendorTaxId),
          confidenceName: this.getConfidence(v.vendorName),
          confidenceAddress: this.getConfidence(v.vendorAddress),
          confidenceTaxId: this.getConfidence(v.vendorTaxId),
        },
      });
    }

    // Insert customer
    if (extracted.customer?.value) {
      const c = extracted.customer.value;
      await this.prisma.customer.upsert({
        where: { documentId: docId },
        update: {
          customerName: this.getValue(c.customerName),
          customerAddress: this.getValue(c.customerAddress),
          confidenceName: this.getConfidence(c.customerName),
          confidenceAddress: this.getConfidence(c.customerAddress),
        },
        create: {
          documentId: docId,
          customerName: this.getValue(c.customerName),
          customerAddress: this.getValue(c.customerAddress),
          confidenceName: this.getConfidence(c.customerName),
          confidenceAddress: this.getConfidence(c.customerAddress),
        },
      });
    }

    // Insert invoice
    if (extracted.invoice?.value) {
      const inv = extracted.invoice.value;
      await this.prisma.invoice.upsert({
        where: { documentId: docId },
        update: {
          invoiceId: this.getValue(inv.invoiceId),
          invoiceDate: this.parseDate(this.getValue(inv.invoiceDate)),
          deliveryDate: this.parseDate(this.getValue(inv.deliveryDate)),
          confidenceInvoiceId: this.getConfidence(inv.invoiceId),
          confidenceInvoiceDate: this.getConfidence(inv.invoiceDate),
          confidenceDeliveryDate: this.getConfidence(inv.deliveryDate),
        },
        create: {
          documentId: docId,
          invoiceId: this.getValue(inv.invoiceId),
          invoiceDate: this.parseDate(this.getValue(inv.invoiceDate)),
          deliveryDate: this.parseDate(this.getValue(inv.deliveryDate)),
          confidenceInvoiceId: this.getConfidence(inv.invoiceId),
          confidenceInvoiceDate: this.getConfidence(inv.invoiceDate),
          confidenceDeliveryDate: this.getConfidence(inv.deliveryDate),
        },
      });
    }

    // Insert payment
    if (extracted.payment?.value) {
      const p = extracted.payment.value;
      await this.prisma.payment.upsert({
        where: { documentId: docId },
        update: {
          dueDate: this.parseDate(this.getValue(p.dueDate)),
          paymentTerms: this.getValue(p.paymentTerms),
          bankAccountNumber: this.getValue(p.bankAccountNumber),
          bic: this.getValue(p.BIC),
          accountName: this.getValue(p.accountName),
          netDays: this.getValue(p.netDays, 0),
          discountPercentage: this.getValue(p.discountPercentage),
          discountDays: this.getValue(p.discountDays, 0),
          discountDueDate: this.parseDate(this.getValue(p.discountDueDate)),
          discountedTotal: this.getValue(p.discountedTotal),
          confidencePaymentTerms: this.getConfidence(p.paymentTerms),
          confidenceBankAccount: this.getConfidence(p.bankAccountNumber),
        },
        create: {
          documentId: docId,
          dueDate: this.parseDate(this.getValue(p.dueDate)),
          paymentTerms: this.getValue(p.paymentTerms),
          bankAccountNumber: this.getValue(p.bankAccountNumber),
          bic: this.getValue(p.BIC),
          accountName: this.getValue(p.accountName),
          netDays: this.getValue(p.netDays, 0),
          discountPercentage: this.getValue(p.discountPercentage),
          discountDays: this.getValue(p.discountDays, 0),
          discountDueDate: this.parseDate(this.getValue(p.discountDueDate)),
          discountedTotal: this.getValue(p.discountedTotal),
          confidencePaymentTerms: this.getConfidence(p.paymentTerms),
          confidenceBankAccount: this.getConfidence(p.bankAccountNumber),
        },
      });
    }

    // Insert summary
    if (extracted.summary?.value) {
      const s = extracted.summary.value;
      await this.prisma.summary.upsert({
        where: { documentId: docId },
        update: {
          documentType: this.getValue(s.documentType),
          subTotal: this.getValue(s.subTotal),
          totalTax: this.getValue(s.totalTax),
          invoiceTotal: this.getValue(s.invoiceTotal),
          currencySymbol: this.getValue(s.currencySymbol),
          confidenceSubTotal: this.getConfidence(s.subTotal),
          confidenceTotalTax: this.getConfidence(s.totalTax),
          confidenceInvoiceTotal: this.getConfidence(s.invoiceTotal),
        },
        create: {
          documentId: docId,
          documentType: this.getValue(s.documentType),
          subTotal: this.getValue(s.subTotal),
          totalTax: this.getValue(s.totalTax),
          invoiceTotal: this.getValue(s.invoiceTotal),
          currencySymbol: this.getValue(s.currencySymbol),
          confidenceSubTotal: this.getConfidence(s.subTotal),
          confidenceTotalTax: this.getConfidence(s.totalTax),
          confidenceInvoiceTotal: this.getConfidence(s.invoiceTotal),
        },
      });
    }

    // Insert line items
    if (extracted.lineItems?.value?.items?.value) {
      const items = extracted.lineItems.value.items.value;
      if (Array.isArray(items)) {
        // Delete existing line items for this document
        await this.prisma.lineItem.deleteMany({
          where: { documentId: docId },
        });

        // Insert new line items
        for (const item of items) {
          await this.prisma.lineItem.create({
            data: {
              documentId: docId,
              srNo: this.getValue(item.srNo),
              description: this.getValue(item.description),
              quantity: this.getValue(item.quantity),
              unitPrice: this.getValue(item.unitPrice),
              totalPrice: this.getValue(item.totalPrice),
              sachkonto: this.getValue(item.Sachkonto),
              buSchluessel: this.getValue(item.BUSchluessel),
              vatRate: this.getValue(item.vatRate, 0),
              vatAmount: this.getValue(item.vatAmount, 0),
              confidenceDescription: this.getConfidence(item.description),
              confidenceQuantity: this.getConfidence(item.quantity),
              confidenceUnitPrice: this.getConfidence(item.unitPrice),
              confidenceTotalPrice: this.getConfidence(item.totalPrice),
            },
          });
        }
      }
    }
  }

  // Main ingestion method
  async ingestFromFile(filePath) {
    console.log(`Starting ingestion from ${filePath}`);

    // Read and parse JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let data = JSON.parse(fileContent);

    // Ensure data is an array
    if (!Array.isArray(data)) {
      data = [data];
    }

    const total = data.length;
    let success = 0;
    let failed = 0;

    // Process each document
    for (let i = 0; i < data.length; i++) {
      const doc = data[i];

      try {
        console.log(`Processing document ${i + 1}/${total}: ${doc.name}`);
        await this.processDocument(doc);
        success++;

        // Log progress every 10 documents
        if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${total} documents processed`);
        }
      } catch (error) {
        console.error(`Error processing document ${doc._id}:`, error.message);
        failed++;
      }
    }

    console.log('\n=== Ingestion Complete ===');
    console.log(`Total documents: ${total}`);
    console.log(`Successfully processed: ${success}`);
    console.log(`Failed: ${failed}`);
  }
}

// Main execution
async function main() {
  const ingestion = new InvoiceDataIngestion(prisma);

  try {
    await ingestion.ingestFromFile('Analytics_Test_Data.json');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { InvoiceDataIngestion };