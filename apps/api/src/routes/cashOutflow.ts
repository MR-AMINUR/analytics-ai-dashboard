import { Router } from "express";
const router = Router();

const cashOutflow = [
  { date: "2025-11-10", amount: 8000 },
  { date: "2025-11-17", amount: 12000 },
  { date: "2025-11-24", amount: 9500 },
  { date: "2025-12-01", amount: 11000 },
];

router.get("/", (_req, res) => {
  res.json(cashOutflow);
});

export default router;
