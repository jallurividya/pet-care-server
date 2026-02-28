import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  deleteNotification
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.put("/:notificationId/read", markAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;