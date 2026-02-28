import express from "express";
import { getMealPlan } from "../controllers/meal.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/:petId", getMealPlan);

export default router;