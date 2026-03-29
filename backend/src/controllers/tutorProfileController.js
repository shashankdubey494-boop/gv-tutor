import TutorProfile from "../models/TutorProfile.js";
import User from "../models/User.js";

/* ---------------- CREATE/UPDATE TUTOR PROFILE ---------------- */
export const createOrUpdateTutorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if user exists and is either "user" or "tutor"
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Prevent admins from creating tutor profiles
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot apply as tutors",
      });
    }
    
    // Allow both "user" and "tutor" roles to create/update tutor profile
    // If user is "user", they will become "tutor" after completing profile
    if (user.role !== "tutor" && user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users and tutors can create tutor profiles",
      });
    }

    const parseArrayField = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // fall through
        }
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return [];
    };

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
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!fullName) missingFields.push("fullName");
    if (!phone) missingFields.push("phone");
    if (!gender) missingFields.push("gender");
    if (!address) missingFields.push("address");
    if (!preferredTiming) missingFields.push("preferredTiming");

    const normalizedSubjects = parseArrayField(subjects);
    const normalizedClasses = parseArrayField(classes);
    const normalizedLocations = parseArrayField(availableLocations);

    if (normalizedSubjects.length === 0) missingFields.push("subjects");
    if (normalizedClasses.length === 0) missingFields.push("classes");
    if (normalizedLocations.length === 0) missingFields.push("availableLocations");

    const normalizedExperience = Number(experience);
    const normalizedHourlyRate = Number(hourlyRate);
    if (!Number.isFinite(normalizedExperience)) missingFields.push("experience");
    if (!Number.isFinite(normalizedHourlyRate)) missingFields.push("hourlyRate");

    const existingProfile = await TutorProfile.findOne({ userId });
    const resumeUrl = req.file
      ? `/uploads/resumes/${req.file.filename}`
      : existingProfile?.resumeUrl || "";
    const resumeOriginalName = req.file
      ? req.file.originalname
      : existingProfile?.resumeOriginalName || "";
    const resumeUploadedAt = req.file
      ? new Date()
      : existingProfile?.resumeUploadedAt || null;

    const hasResume = Boolean(resumeUrl);
    if (!hasResume) {
      missingFields.push("resume");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const isProfileComplete = missingFields.length === 0;

    // Create or update profile
    const profile = await TutorProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        fullName,
        phone,
        gender,
        address,
        experience: normalizedExperience,
        subjects: normalizedSubjects,
        classes: normalizedClasses,
        availableLocations: normalizedLocations,
        preferredTiming,
        hourlyRate: normalizedHourlyRate,
        bio: bio || "",
        achievements: achievements || "",
        resumeUrl,
        resumeOriginalName,
        resumeUploadedAt,
        isProfileComplete,
      },
      { upsert: true, new: true, runValidators: true }
    );

    const userUpdates = { isTutorProfileComplete: isProfileComplete };
    if (isProfileComplete && user.role !== "tutor") {
      userUpdates.role = "tutor";
    }

    await User.findByIdAndUpdate(userId, userUpdates);

    if (isProfileComplete) {
      console.log(`✅ User ${userId} has completed tutor profile and is now a tutor`);
    } else {
      console.log(`⚠️ User ${userId} profile saved but incomplete (resume missing)`);
    }

    return res.status(200).json({
      success: true,
      message: isProfileComplete
        ? "Profile completed successfully. You are now a tutor!"
        : "Profile saved, but resume is required to complete the profile.",
      profile,
    });
  } catch (error) {
    console.error("Create/update tutor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const isProfileCompleteForResume = (profile) => {
  if (!profile) return false;
  const requiredValues = [
    profile.fullName,
    profile.phone,
    profile.gender,
    profile.address,
    profile.experience,
    profile.preferredTiming,
    profile.hourlyRate,
  ];
  const hasArrays =
    Array.isArray(profile.subjects) &&
    profile.subjects.length > 0 &&
    Array.isArray(profile.classes) &&
    profile.classes.length > 0 &&
    Array.isArray(profile.availableLocations) &&
    profile.availableLocations.length > 0;
  const hasBasic = requiredValues.every((value) => value !== undefined && value !== null && value !== "");
  return hasBasic && hasArrays && Boolean(profile.resumeUrl);
};

/* ---------------- UPLOAD RESUME ONLY ---------------- */
export const uploadTutorResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Admins cannot apply as tutors" });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please complete your profile first.",
      });
    }

    profile.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    profile.resumeOriginalName = req.file.originalname;
    profile.resumeUploadedAt = new Date();

    profile.isProfileComplete = isProfileCompleteForResume(profile);
    await profile.save();

    await User.findByIdAndUpdate(userId, {
      isTutorProfileComplete: profile.isProfileComplete,
    });

    return res.status(200).json({
      success: true,
      message: profile.isProfileComplete
        ? "Resume uploaded. Profile is now complete."
        : "Resume uploaded. Complete remaining fields to finish your profile.",
      profile,
    });
  } catch (error) {
    console.error("Upload resume error:", error);
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
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const shouldBeComplete = isProfileCompleteForResume(profile);
    if (profile.isProfileComplete !== shouldBeComplete) {
      profile.isProfileComplete = shouldBeComplete;
      await profile.save();
      await User.findByIdAndUpdate(userId, {
        isTutorProfileComplete: shouldBeComplete,
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

