import express from "express";
import {
  createPolicy,
  getAllPolicies,
  subscribePolicy,
  getPetInsurance,
  updateClaimStatus,
  deletePolicy,
  updatePolicyDetails,
  getAllSubscriptions
} from "../controllers/insurance.controller.js";

import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// ADMIN ROUTES 
router.post("/policies", roleMiddleware("admin"), createPolicy);
router.get("/policies", getAllPolicies);
router.delete("/policies/:id", roleMiddleware("admin"), deletePolicy);
router.put("/claim/:id", roleMiddleware("admin"), updateClaimStatus);
//router.get("/all-claims",displayClaims)
router.put("/policies/:id", roleMiddleware("admin"), updatePolicyDetails)
router.get("/subscriptions", roleMiddleware("admin"), getAllSubscriptions)

// USER ROUTES 
router.post("/subscribe", subscribePolicy);

router.get("/pet/:petId", getPetInsurance);

export default router;