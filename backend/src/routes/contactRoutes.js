import express from "express";
import {
  createContactMessage,
  getAllContactMessages,
  updateMessageStatus,
  deleteContactMessage,
} from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Public route - submit contact form
router.post("/submit", createContactMessage);

// Admin routes - manage messages
router.get("/all", protect, requireAdmin, getAllContactMessages);
router.patch("/:messageId/status", protect, requireAdmin, updateMessageStatus);
router.delete("/:messageId", protect, requireAdmin, deleteContactMessage);

export default router;
