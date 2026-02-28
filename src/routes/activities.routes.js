import express from "express";
import {
  createActivity,
  getActivitiesByPet,
  updateActivity,
  deleteActivity,
  getActivitySummary
} from "../controllers/activities.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", createActivity);
router.get("/pet/:petId", getActivitiesByPet);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);
router.get("/summary/:petId", getActivitySummary);

export default router;