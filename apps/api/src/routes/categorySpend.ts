import { Router } from "express";
const router = Router();

const categorySpend = [
  { category: "Office Supplies", amount: 18000 },
  { category: "Technology", amount: 25000 },
  { category: "Logistics", amount: 12000 },
  { category: "Services", amount: 10000 },
];

router.get("/", (_req, res) => {
  res.json(categorySpend);
});

export default router;
