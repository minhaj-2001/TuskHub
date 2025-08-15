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





















// // backend/routes/index.js
// import express from "express";
// import authRoutes from "./auth.js";
// import projectRoutes from "./project.js";
// import stageRoutes from "./stage.js";
// import emailRoutes from "./email.js";
// import userRoutes from "./user.js";

// const router = express.Router();

// router.use("/auth", authRoutes);
// router.use("/projects", projectRoutes);
// router.use("/stages", stageRoutes);
// router.use("/emails", emailRoutes);
// router.use("/users", userRoutes);

// export default router;





// import express from "express";

// import authRoutes from "./auth.js";
// // import workspaceRoutes from "./workspace.js";
// // In your main server file (e.g., index.js or app.js)
// import projectRoutes from './project.js';

// // ... other middleware and routes
// // import taskRoutes from "./task.js";
// import userRoutes from "./user.js";

// import stageRoutes from './stage.js';

// import emailRoutes from "./email.js"; // <-- Add this line

// const router = express.Router();

// router.use("/auth", authRoutes);
// // router.use("/workspaces", workspaceRoutes);
// router.use("/projects", projectRoutes);
// // router.use("/tasks", taskRoutes);
// router.use("/users", userRoutes);
// router.use("/emails", emailRoutes); // <-- Add this line

// // ... other middleware and routes

// router.use('/stages', stageRoutes);

// // ... rest of your server configuration

// // app.use('/projects', projectRoutes);

// // ... rest of your server configuration

// export default router;
