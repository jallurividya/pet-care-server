import express from "express";
import {
  createExpense,
  getExpenses,
  getSingleExpense,
  updateExpense,
  deleteExpense
} from "../controllers/expense.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/:id", getSingleExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;