import express from "express";
import authRoutes from "./auth.js";
import projectRoutes from "./project.js";
import userRoutes from "./user.js";
import emailRoutes from "./email.js";
import stageRoutes from "./stage.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/users", userRoutes);
router.use("/emails", emailRoutes);
router.use("/stages", stageRoutes);

export default router;