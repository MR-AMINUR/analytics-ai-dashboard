import express from "express";
import { mockVendors } from "../data/mockData";

const router = express.Router();

router.get("/top10", (req, res) => {
  res.json(mockVendors);
});

export default router;
