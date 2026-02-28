import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPlaydate,
  deletePlaydate,
  getPlaydates,
  rsvpPlaydate,
  updatePlaydate
} from "../controllers/playdates.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPlaydate);
router.get("/", getPlaydates); 
router.post("/:playdateId/rsvp", rsvpPlaydate); 
router.put("/:playdateId", updatePlaydate);
router.delete("/:playdateId", deletePlaydate);

export default router;