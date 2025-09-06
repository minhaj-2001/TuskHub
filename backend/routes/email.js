// backend/routes/email.js
import express from "express";
import {
  getAllEmails,
  addEmail,
  updateEmail,
  deleteEmail,
  shareProjectDetails
} from "../controllers/email.js";
import authenticateUser from "../middleware/auth-middleware.js";

const router = express.Router();

// Apply authentication middleware to all email routes
router.use(authenticateUser);

router.get("/all-emails", getAllEmails);
router.post("/add-email", addEmail);
router.put("/update-email/:id", updateEmail);
router.delete("/delete-email/:id", deleteEmail);
router.post("/share-project", shareProjectDetails);

export default router;