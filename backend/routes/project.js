// backend/routes/project.js
import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addStageToProject,
  updateProjectStage,
  deleteProjectStage,
  createStageConnection,
  getProjectStageConnections,
  getProjectYears,
  updateProjectStatus  // Add this import
} from "../controllers/project.js";

const router = express.Router();

// Apply authentication middleware to all project routes
router.use(authenticateUser);

router.post("/project", createProject);
router.get("/all-projects", getAllProjects);
router.get("/project-years", getProjectYears);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.patch("/:id/status", updateProjectStatus); // Add this route for status updates
router.delete("/delete-project/:id", deleteProject);
router.post("/:projectId/stages", addStageToProject);
router.put("/:projectId/stages/:stageId", updateProjectStage);
router.delete("/:projectId/stages/:stageId", deleteProjectStage);
router.post("/:projectId/connections", createStageConnection);
router.get("/:projectId/connections", getProjectStageConnections);

export default router;