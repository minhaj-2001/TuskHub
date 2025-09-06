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










// import express from "express";
// import authenticateUser from "../middleware/auth-middleware.js";
// import {
//   addStage,
//   getAllStages,
//   updateStage,
//   deleteStage,
// } from "../controllers/stage.js";
// import { z } from "zod";
// import { validateRequest } from "zod-express-middleware";

// const router = express.Router();

// router.get("/all-stages", authenticateUser, getAllStages);
// router.post(
//   "/add-stage",
//   authenticateUser,
//   validateRequest({
//     body: z.object({
//       stage_name: z.string().min(1, "Stage name is required"),
//       description: z.string().optional(),
//     }),
//   }),
//   addStage
// );
// router.put(
//   "/update-stage/:id",
//   authenticateUser,
//   validateRequest({
//     body: z.object({
//       stage_name: z.string().min(1, "Stage name is required"),
//       description: z.string().optional(),
//     }),
//   }),
//   updateStage
// );
// router.delete("/delete-stage/:id", authenticateUser, deleteStage);

// export default router;





// import express from "express";
// import {
//   getAllStages,
//   addStage,
//   updateStage,
//   deleteStage,
// } from "../controllers/stage.js";

// const router = express.Router();

// router.get("/all-stages", getAllStages);
// router.post("/add-stage", addStage);
// router.put("/update-stage/:id", updateStage);
// router.delete("/delete-stage/:id", deleteStage);

// export default router;