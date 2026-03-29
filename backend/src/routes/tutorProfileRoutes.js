import express from "express";
import {
  createOrUpdateTutorProfile,
  getTutorProfile,
} from "../controllers/tutorProfileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create or update tutor profile
router.post("/", createOrUpdateTutorProfile);
router.put("/", createOrUpdateTutorProfile);

// Get tutor profile
router.get("/", getTutorProfile);

export default router;




