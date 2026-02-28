import express from "express";
import { getDietSuggestion } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/diet", getDietSuggestion);

export default router