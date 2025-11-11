import { Request, Response } from "express";
import { fetchCashOutflowForecast } from "../services/cashflow.service";

export const getCashOutflow = async (req: Request, res: Response) => {
  try {
    const data = await fetchCashOutflowForecast();
    res.json(data);
  } catch (err) {
    console.error("getCashOutflow error:", err);
    res.status(500).json({ error: "Failed to fetch cash outflow forecast" });
  }
};
