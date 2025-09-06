// backend/routes/customProjectStage.js
import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  createCustomProjectStage,
  getCustomProjectStages,
} from "../controllers/customProjectStage.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

router.post("/", createCustomProjectStage);
router.get("/project/:projectId", getCustomProjectStages);

export default router;