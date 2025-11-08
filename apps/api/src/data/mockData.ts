export const mockInvoices = [
  { id: 1, vendor: "Acme Corp", invoiceNo: "INV-001", amount: 2500, status: "Paid", date: "2025-01-10" },
  { id: 2, vendor: "Globex Ltd", invoiceNo: "INV-002", amount: 4200, status: "Pending", date: "2025-02-05" },
  { id: 3, vendor: "Initech", invoiceNo: "INV-003", amount: 1800, status: "Overdue", date: "2025-03-01" }
];

export const mockVendors = [
  { id: 1, name: "Acme Corp", totalSpend: 12000 },
  { id: 2, name: "Globex Ltd", totalSpend: 8000 },
  { id: 3, name: "Initech", totalSpend: 5500 }
];
