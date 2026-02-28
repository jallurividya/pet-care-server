import express from "express";
import {
  createHealthLog,
  getHealthLogsByPet,
  updateHealthLog,
  deleteHealthLog,
  getWeightTrend
} from "../controllers/health.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", createHealthLog);
router.get("/weight/:petId", getWeightTrend);
router.get("/pet/:petId", getHealthLogsByPet);
router.put("/:id", updateHealthLog);
router.delete("/:id", deleteHealthLog);

export default router;