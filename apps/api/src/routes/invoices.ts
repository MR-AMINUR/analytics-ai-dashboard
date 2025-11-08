import express from "express";
import { mockInvoices } from "../data/mockData";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(mockInvoices);
});

export default router;
