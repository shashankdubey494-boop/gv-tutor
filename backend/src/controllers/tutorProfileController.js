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
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Create or update profile
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
        isProfileComplete: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Update user: change role to "tutor" and set isTutorProfileComplete flag
    // This converts a "user" to a "tutor" after completing tutor profile
    await User.findByIdAndUpdate(userId, {
      role: "tutor", // Change role from "user" to "tutor"
      isTutorProfileComplete: true,
    });

    console.log(`✅ User ${userId} has completed tutor profile and is now a tutor`);

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully. You are now a tutor!",
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

