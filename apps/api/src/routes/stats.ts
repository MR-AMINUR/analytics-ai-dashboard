import { Router } from "express";

// Temporary mock data — replace later with real DB data
const mockInvoices = [
  { id: 1, vendor: "ABC Supplies", amount: 2500 },
  { id: 2, vendor: "XYZ Traders", amount: 1800 },
  { id: 3, vendor: "Global Corp", amount: 3200 },
  { id: 4, vendor: "TechSource", amount: 2200 },
];

const router = Router();

router.get("/", (_req, res) => {
  try {
    const totalSpend = mockInvoices.reduce((sum, i) => sum + i.amount, 0);
    const totalInvoices = mockInvoices.length;
    const avgInvoice =
      totalInvoices > 0 ? totalSpend / totalInvoices : 0;

    res.json({
      totalSpend,
      totalInvoices,
      avgInvoice,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
