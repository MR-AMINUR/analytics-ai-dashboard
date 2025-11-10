// src/routes/cashflow.routes.ts
import { Router } from "express";
import { getCashOutflow } from "../controllers/cashflow.controller";

const router = Router();

// optional query params: start, end (ISO dates)
router.get("/", getCashOutflow);

export default router;
