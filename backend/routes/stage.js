import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  createStage,
  getAllStages,
  getStageById,
  updateStage,
  deleteStage,
  deleteCustomStageFromProject
} from "../controllers/stage.js";

const router = express.Router();

// Apply authentication middleware to all stage routes
router.use(authenticateUser);

router.post("/add-stage", createStage);
router.get("/all-stages", getAllStages);
router.get("/:id", getStageById);
router.put("/update-stage/:id", updateStage);
router.delete("/delete-stage/:id", deleteStage);
router.post("/delete-custom-stage-from-project", deleteCustomStageFromProject); // Fixed route name

export default router;