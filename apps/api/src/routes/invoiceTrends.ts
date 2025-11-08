import { Router } from "express";
const router = Router();

const mockTrends = [
  { month: "Jan", count: 30, total: 45000 },
  { month: "Feb", count: 25, total: 38000 },
  { month: "Mar", count: 35, total: 52000 },
  { month: "Apr", count: 28, total: 41000 },
  { month: "May", count: 32, total: 49000 },
];

router.get("/", (_req, res) => {
  res.json(mockTrends);
});

export default router;
