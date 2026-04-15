import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TutorRequest from "../models/TutorRequest.js";
import TutorProfile from "../models/TutorProfile.js";
import { RESUME_UPLOAD_DIR } from "../config/resumeUpload.js";
import { notificationService } from '../../notifications/index.js';
import { getTokenCookieOptions } from "../utils/cookieOptions.js";

/* ---------------- ADMIN LOGIN ---------------- */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user and check if admin
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or not an admin",
      });
    }

    // Check if admin has password (manually created admins should have password)
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Admin account not properly configured",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, getTokenCookieOptions(24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- GET ALL PARENT APPLICATIONS ---------------- */
export const getAllParentApplications = async (req, res) => {
  try {
    const requests = await TutorRequest.find()
      .sort({ createdAt: -1 })
      .populate("assignedTutor", "email")
      .populate({
        path: "appliedTutors.tutorId",
        select: "email",
      });

    // Populate tutor profiles separately
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const requestObj = request.toObject();
        if (requestObj.appliedTutors && requestObj.appliedTutors.length > 0) {
          requestObj.appliedTutors = await Promise.all(
            requestObj.appliedTutors.map(async (applied) => {
              // Handle both populated and non-populated tutorId
              const tutorId = applied.tutorId?._id || applied.tutorId || applied.tutorId?.toString();
              const tutorProfile = tutorId ? await TutorProfile.findOne({ userId: tutorId }) : null;
              
              return {
                ...applied,
                tutorProfile: tutorProfile ? tutorProfile.toObject() : null,
                tutorId: applied.tutorId || null, // Keep the original tutorId reference
              };
            })
          );
        }
        return requestObj;
      })
    );

    return res.status(200).json({
      success: true,
      requests: requestsWithProfiles,
      count: requestsWithProfiles.length,
    });
  } catch (error) {
    console.error("Get parent applications error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- GET ALL TUTOR APPLICATIONS (Tutor Profiles) ---------------- */
export const getAllTutorApplications = async (req, res) => {
  try {
    const profiles = await TutorProfile.find()
      .populate("userId", "email role isTutorProfileComplete createdAt updatedAt")
      .sort({ createdAt: -1 });

    // Get applied posts for each tutor
    const profilesWithAppliedPosts = await Promise.all(
      profiles.map(async (profile) => {
        const profileObj = profile.toObject();
        // Find all requests where this tutor has applied
        const appliedRequests = await TutorRequest.find({
          "appliedTutors.tutorId": profile.userId._id,
        })
          .select("parentName studentGrade subjects status createdAt")
          .sort({ createdAt: -1 });
        
        profileObj.appliedPosts = appliedRequests || [];
        return profileObj;
      })
    );

    return res.status(200).json({
      success: true,
      profiles: profilesWithAppliedPosts,
      count: profilesWithAppliedPosts.length,
    });
  } catch (error) {
    console.error("Get tutor applications error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- GET ALL TUTOR MEMBERS ---------------- */
export const getAllTutorMembers = async (req, res) => {
  try {
    const tutors = await User.find({ role: "tutor" })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    const tutorsWithProfiles = await Promise.all(
      tutors.map(async (tutor) => {
        const profile = await TutorProfile.findOne({ userId: tutor._id });
        return {
          ...tutor.toObject(),
          profile: profile || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      tutors: tutorsWithProfiles,
      count: tutorsWithProfiles.length,
    });
  } catch (error) {
    console.error("Get tutor members error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- UPDATE TUTOR REQUEST STATUS ---------------- */
export const updateTutorRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    if (!["pending", "approved", "rejected", "filled", "posted"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const request = await TutorRequest.findByIdAndUpdate(
      requestId,
      {
        status,
        adminNotes: adminNotes || "",
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request status updated",
      request,
    });
  } catch (error) {
    console.error("Update request status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- UPDATE FIELD VISIBILITY ---------------- */
export const updateFieldVisibility = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { fieldVisibility } = req.body;

    if (!fieldVisibility || typeof fieldVisibility !== "object") {
      return res.status(400).json({
        success: false,
        message: "Field visibility object required",
      });
    }

    const request = await TutorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Update field visibility
    request.fieldVisibility = {
      ...request.fieldVisibility,
      ...fieldVisibility,
    };

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Field visibility updated",
      request,
    });
  } catch (error) {
    console.error("Update field visibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- UPDATE TUTOR REQUEST FIELDS ---------------- */
export const updateTutorRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const {
      parentName,
      parentEmail,
      parentPhone,
      studentGrade,
      subjects,
      preferredLocation,
      preferredTiming,
      frequency,
      budget,
      preferredTutorGender,
      teacherExperience,
      additionalRequirements,
      fieldVisibility,
    } = req.body;

    const request = await TutorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Update fields if provided
    if (parentName !== undefined) request.parentName = parentName;
    if (parentEmail !== undefined) request.parentEmail = parentEmail;
    if (parentPhone !== undefined) request.parentPhone = parentPhone;
    if (studentGrade !== undefined) request.studentGrade = studentGrade;
    if (subjects !== undefined) request.subjects = Array.isArray(subjects) ? subjects : [subjects];
    if (preferredLocation !== undefined) request.preferredLocation = preferredLocation;
    if (preferredTiming !== undefined) request.preferredTiming = preferredTiming;
    if (frequency !== undefined) request.frequency = frequency;
    if (budget !== undefined) request.budget = budget;
    if (preferredTutorGender !== undefined) request.preferredTutorGender = preferredTutorGender;
    if (teacherExperience !== undefined) {
      const parsedTeacherExperience = parseInt(teacherExperience, 10);
      if (
        Number.isNaN(parsedTeacherExperience) ||
        parsedTeacherExperience < 0 ||
        parsedTeacherExperience > 50
      ) {
        return res.status(400).json({
          success: false,
          message: "Teacher experience must be a number between 0 and 50",
        });
      }
      request.teacherExperience = parsedTeacherExperience;
    }
    if (additionalRequirements !== undefined) request.additionalRequirements = additionalRequirements;
    if (fieldVisibility !== undefined) {
      request.fieldVisibility = {
        ...request.fieldVisibility,
        ...fieldVisibility,
      };
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request updated successfully",
      request,
    });
  } catch (error) {
    console.error("Update request error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- POST TUTOR REQUEST (Make it visible to tutors) ---------------- */
export const postTutorRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user?.userId;

    const request = await TutorRequest.findByIdAndUpdate(
      requestId,
      { status: "posted" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Return immediately so admin UI doesn't wait for notification fan-out.
    res.status(200).json({
      success: true,
      message: "Request posted successfully. It will now be visible to tutors.",
      request,
    });

    // Notify tutors in background after response.
    setImmediate(async () => {
      try {
        await notificationService.notifyAllTutors({
          type: "new_job",
          title: `New Tutor Request: ${request.subjects.join(", ")}`,
          message: `A new tutoring request for ${request.subjects.join(", ")} in ${request.preferredLocation} has been posted.`,
          relatedId: request._id,
          relatedCollection: "tutorrequests",
          createdBy: adminId,
          templateData: {
            jobId: request._id,
            jobTitle: `Tutor needed for ${request.subjects.join(", ")}`,
            subject: request.subjects.join(", "),
            location: request.preferredLocation,
            budget: request.budget,
            jobDetails:
              request.additionalRequirements ||
              `Grade: ${request.studentGrade}, Timing: ${request.preferredTiming}, Frequency: ${request.frequency}`,
          },
        });
      } catch (notifError) {
        console.error("Notification failed (request already posted):", notifError);
      }
    });

    return;
  } catch (error) {
    console.error("Post request error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- DOWNLOAD TUTOR RESUME (ADMIN) ---------------- */
export const downloadTutorResumeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id required",
      });
    }

    const profile = await TutorProfile.findOne({ userId });
    if (!profile?.resumeStoredFileName) {
      return res.status(404).json({
        success: false,
        message: "No resume on file for this tutor",
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
  } catch (error) {
    console.error("Admin download resume error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ---------------- DELETE TUTOR REQUEST ---------------- */
export const deleteTutorRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const deleted = await TutorRequest.findByIdAndDelete(requestId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Delete request error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





