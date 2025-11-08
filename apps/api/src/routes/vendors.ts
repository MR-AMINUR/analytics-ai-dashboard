import { Router } from "express";

const router = Router();

const mockVendors = [
  { vendor: "ABC Supplies", spend: 2500 },
  { vendor: "XYZ Traders", spend: 1800 },
  { vendor: "Global Corp", spend: 3200 },
  { vendor: "TechSource", spend: 2200 },
  { vendor: "Innova Inc", spend: 1750 },
  { vendor: "Delta Services", spend: 1600 },
  { vendor: "QuickParts", spend: 1450 },
  { vendor: "SmartTrade", spend: 1300 },
  { vendor: "Greenline", spend: 1250 },
  { vendor: "NextGen", spend: 1100 },
];

router.get("/top10", (_req, res) => {
  res.json(mockVendors);
});

export default router;
