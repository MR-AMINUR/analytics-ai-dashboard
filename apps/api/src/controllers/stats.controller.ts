// src/controllers/stats.controller.ts
import { Request, Response } from "express";
import { fetchStats } from "../services/stats.service";

export const getStats = async (req: Request, res: Response) => {
  try {
    const data = await fetchStats();
    res.json(data);
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
