import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import TutorProfile from "../models/TutorProfile.js";
import User from "../models/User.js";
import { RESUME_UPLOAD_DIR } from "../config/resumeUpload.js";

function clientErrorMessage(error) {
  if (error instanceof mongoose.Error.ValidationError) {
    return Object.values(error.errors)
      .map((e) => e.message)
      .join(", ");
  }
  if (error instanceof mongoose.Error.CastError) {
    return "Invalid data submitted";
  }
  if (error?.name === "MongoServerError" && error?.code === 11000) {
    return "A profile already exists for this account.";
  }
  return null;
}

/** Legacy rows may omit isProfileComplete; trust User flags when the doc clearly exists. */
function tutorEstablishedOnAccount(user, existingProfile) {
  if (user.isTutorProfileComplete === true) return true;
  if (user.role === "tutor" && existingProfile?.fullName) return true;
  return false;
}

async function unlinkResumeIfExists(storedName) {
  if (!storedName) return;
  const abs = path.join(RESUME_UPLOAD_DIR, storedName);
  try {
    await fs.promises.unlink(abs);
  } catch {
    /* ignore missing file */
  }
}

function readField(body, key, fallback = "") {
  const v = body[key];
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function parseStringArray(raw) {
  if (!raw && raw !== 0) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim()).filter(Boolean);
      }
    } catch {
      /* fall through */
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseMultipartOrJsonBody(req) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const fullName = readField(body, "fullName");
  const phone = readField(body, "phone");
  const gender = readField(body, "gender").toLowerCase();
  const address = readField(body, "address");
  const experienceRaw = readField(body, "experience");
  const preferredTiming = readField(body, "preferredTiming");
  const hourlyRateRaw = readField(body, "hourlyRate");
  const bio = readField(body, "bio");
  const achievements = readField(body, "achievements");

  const subjects = parseStringArray(body.subjects);
  const classes = parseStringArray(body.classes);
  const availableLocations = parseStringArray(body.availableLocations);

  const experience = parseInt(experienceRaw, 10);
  const hourlyRate = parseFloat(hourlyRateRaw);

  return {
    fullName,
    phone,
    gender,
    address,
    experience,
    subjects,
    classes,
    availableLocations,
    preferredTiming,
    hourlyRate,
    bio,
    achievements,
  };
}

/* ---------------- CREATE/UPDATE TUTOR PROFILE ---------------- */
export const createOrUpdateTutorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot apply as tutors",
      });
    }

    if (user.role !== "tutor" && user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users and tutors can create tutor profiles",
      });
    }

    const {
      fullName,
      phone,
      gender,
      address,
      experience,
      subjects,
      classes,
      availableLocations,
      preferredTiming,
      hourlyRate,
      bio,
      achievements,
    } = parseMultipartOrJsonBody(req);

    const requiredFields = {
      fullName,
      phone,
      gender,
      address,
      experience,
      subjects,
      classes,
      availableLocations,
      preferredTiming,
      hourlyRate,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => {
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === "number") return Number.isNaN(value);
        return value === "" || value === undefined || value === null;
      })
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender value",
      });
    }

    const existing = await TutorProfile.findOne({ userId });

    let resumeStoredFileName = existing?.resumeStoredFileName || "";
    let resumeOriginalName = existing?.resumeOriginalName || "";
    let resumeMimeType = existing?.resumeMimeType || "";

    if (req.file) {
      if (existing?.resumeStoredFileName) {
        await unlinkResumeIfExists(existing.resumeStoredFileName);
      }
      resumeStoredFileName = req.file.filename;
      resumeOriginalName = req.file.originalname || "resume";
      resumeMimeType = req.file.mimetype || "application/octet-stream";
    }

    const profile = await TutorProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        fullName,
        phone,
        gender,
        address,
        experience,
        subjects: Array.isArray(subjects) ? subjects : [subjects],
        classes: Array.isArray(classes) ? classes : [classes],
        availableLocations: Array.isArray(availableLocations)
          ? availableLocations
          : [availableLocations],
        preferredTiming,
        hourlyRate,
        bio: bio || "",
        achievements: achievements || "",
        resumeStoredFileName,
        resumeOriginalName,
        resumeMimeType,
        isProfileComplete: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    await User.findByIdAndUpdate(userId, {
      role: "tutor",
      isTutorProfileComplete: true,
    });

    console.log(`✅ User ${userId} tutor profile saved`);

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully. You are now a tutor!",
      profile,
    });
  } catch (error) {
    if (req.file?.filename) {
      await unlinkResumeIfExists(req.file.filename);
    }
    console.error("Create/update tutor profile error:", error);
    const clientMsg = clientErrorMessage(error);
    if (clientMsg) {
      return res.status(400).json({ success: false, message: clientMsg });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- UPLOAD RESUME ONLY (existing tutors) ---------------- */
export const uploadTutorResumeOnly = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose a resume file (PDF, DOC, or DOCX).",
      });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "tutor") {
      await unlinkResumeIfExists(req.file.filename);
      return res.status(403).json({
        success: false,
        message: "Only tutors can upload a resume",
      });
    }

    const profile = await TutorProfile.findOne({ userId });
    const docOk = profile?.isProfileComplete === true;
    const established = tutorEstablishedOnAccount(user, profile);
    if (!profile || (!docOk && !established)) {
      await unlinkResumeIfExists(req.file.filename);
      return res.status(400).json({
        success: false,
        message: "Complete your tutor profile before uploading a resume",
      });
    }

    if (profile.resumeStoredFileName) {
      await unlinkResumeIfExists(profile.resumeStoredFileName);
    }

    profile.resumeStoredFileName = req.file.filename;
    profile.resumeOriginalName = req.file.originalname || "resume";
    profile.resumeMimeType = req.file.mimetype || "application/octet-stream";
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      profile,
    });
  } catch (error) {
    if (req.file?.filename) {
      await unlinkResumeIfExists(req.file.filename);
    }
    console.error("Upload resume error:", error);
    const clientMsg = clientErrorMessage(error);
    if (clientMsg) {
      return res.status(400).json({ success: false, message: clientMsg });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

function streamResumeFile(profile, res) {
  if (!profile?.resumeStoredFileName) {
    return res.status(404).json({
      success: false,
      message: "No resume on file",
    });
  }

  const abs = path.join(RESUME_UPLOAD_DIR, profile.resumeStoredFileName);
  if (!fs.existsSync(abs)) {
    return res.status(404).json({
      success: false,
      message: "Resume file not found on server",
    });
  }

  const downloadName = profile.resumeOriginalName || "resume.pdf";
  res.setHeader("Content-Type", profile.resumeMimeType || "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`
  );

  return fs.createReadStream(abs).pipe(res);
}

/* ---------------- DOWNLOAD OWN RESUME ---------------- */
export const downloadOwnTutorResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await TutorProfile.findOne({ userId });
    return streamResumeFile(profile, res);
  } catch (error) {
    console.error("Download resume error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- GET TUTOR PROFILE ---------------- */
export const getTutorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await TutorProfile.findOne({ userId });

    if (!profile) {
      return res.status(200).json({
        success: true,
        profile: null,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get tutor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
