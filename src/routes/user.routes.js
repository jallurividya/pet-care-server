import express from "express";
import {
  getMe,
  updateMe,
  getAllUsers,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

router.get("/", authMiddleware, getAllUsers);
router.delete("/:id", authMiddleware, deleteUser);

export default router;