import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.js";
import {
  getReferredUsers,
  toggleUserStatus,
  getReferralLink
} from "../controllers/userManagement.js";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const router = express.Router();

// Profile routes
router.get("/profile", authenticateUser, getUserProfile);
router.put(
  "/profile",
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z.string(),
      profilePicture: z.string().optional(),
    }),
  }),
  updateUserProfile
);
router.put(
  "/change-password",
  authenticateUser,
  validateRequest({
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    }),
  }),
  changePassword
);

// User management routes (for managers)
router.get("/referred-users", authenticateUser, getReferredUsers);
router.put("/users/:userId/toggle-status", authenticateUser, toggleUserStatus);
router.get("/referral-link", authenticateUser, getReferralLink);

export default router;