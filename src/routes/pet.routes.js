import express from "express";
import {
  createPet,
  getPets,
  getSinglePet,
  updatePet,
  deletePet
} from "../controllers/pet.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getWeightTrend } from "../controllers/health.controller.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post("/", createPet);
router.get("/", getPets);
router.get("/:id", getSinglePet);
router.put("/:id", updatePet);
router.delete("/:id", deletePet);

router.get("/weight/:petId", authMiddleware, getWeightTrend);

export default router;