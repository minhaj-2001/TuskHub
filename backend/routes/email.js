import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  addEmail,
  getAllEmails,
  updateEmail,
  deleteEmail,
} from "../controllers/email.js";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const router = express.Router();

router.get("/all-emails", authenticateUser, getAllEmails);
router.post(
  "/add-email",
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
    }),
  }),
  addEmail
);
router.put(
  "/update-email/:id",
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
    }),
  }),
  updateEmail
);
router.delete("/delete-email/:id", authenticateUser, deleteEmail);

export default router;







// import express from "express";
// import {
//   getAllEmails,
//   addEmail,
//   updateEmail,
//   deleteEmail,
// } from "../controllers/email.js";

// const router = express.Router();

// router.get("/all-emails", getAllEmails);
// router.post("/add-email", addEmail);
// router.put("/update-email/:id", updateEmail);
// router.delete("/delete-email/:id", deleteEmail);

// export default router;