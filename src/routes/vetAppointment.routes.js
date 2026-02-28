import express from "express";
import {
  createVetAppointment,
  getVetAppointments,
  getSingleVetAppointment,
  updateVetAppointment,
  deleteVetAppointment,
  getNearbyEmergencyVets
} from "../controllers/vetAppointment.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createVetAppointment);
router.get("/", getVetAppointments);
router.get("/:id", getSingleVetAppointment);
router.put("/:id", updateVetAppointment);
router.delete("/:id", deleteVetAppointment);
router.get("/", getNearbyEmergencyVets);

export default router;