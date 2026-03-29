import express from "express";
import {
  createOrUpdateTutorProfile,
  getTutorProfile,
  uploadTutorResume,
} from "../controllers/tutorProfileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { resumeUpload } from "../middleware/resumeUpload.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

const withResumeUpload = (req, res, next) =>
  resumeUpload.single("resume")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Resume upload failed",
      });
    }
    return next();
  });

// Create or update tutor profile
router.post("/", withResumeUpload, createOrUpdateTutorProfile);
router.put("/", withResumeUpload, createOrUpdateTutorProfile);

// Get tutor profile
router.get("/", getTutorProfile);

// Upload resume only (for existing tutors)
router.post("/resume", withResumeUpload, uploadTutorResume);

export default router;




