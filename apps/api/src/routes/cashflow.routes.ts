import { Router } from "express";
import { getCashOutflow } from "../controllers/cashflow.controller";

const router = Router();
router.get("/", getCashOutflow);
export default router;
