// src/controllers/cashflow.controller.ts
import { Request, Response } from "express";
import { fetchCashOutflow } from "../services/cashflow.service";

export const getCashOutflow = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(String(start)) : undefined;
    const endDate = end ? new Date(String(end)) : undefined;
    const data = await fetchCashOutflow(startDate, endDate);
    res.json(data);
  } catch (err) {
    console.error("getCashOutflow error:", err);
    res.status(500).json({ error: "Failed to fetch cash outflow" });
  }
};
