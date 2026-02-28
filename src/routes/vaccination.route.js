import express from "express";
import {
  createVaccination,
  getVaccinations,
  getSingleVaccination,
  updateVaccination,
  deleteVaccination
} from "../controllers/vaccination.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

router.post("/", createVaccination);
router.get("/", getVaccinations);
router.get("/:id", getSingleVaccination);
router.put("/:id", updateVaccination);
router.delete("/:id", deleteVaccination);

export default router;