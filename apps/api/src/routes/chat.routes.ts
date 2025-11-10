import express from "express";
import { chatWithData } from "../controllers/chat.controller";

const router = express.Router();

router.post("/", chatWithData);

export default router;
