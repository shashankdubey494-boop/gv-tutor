import express from "express";
import { signup, login } from "../controllers/authController.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";
import { csrfTokenGuard, issueCsrfToken } from "../middleware/csrfTokenGuard.js";
import User from "../models/User.js";

const router = express.Router();

// Rate limiting for auth routes (30 requests per 15 minutes per IP)
const authRateLimit = rateLimiter(30, 15 * 60 * 1000);

router.post("/signup", authRateLimit, signup);
router.post("/login", authRateLimit, login);

router.get("/csrf-token", (req, res) => {
  const token = issueCsrfToken(res);
  return res.status(200).json({
    success: true,
    csrfToken: token,
  });
});

// Verify authentication endpoint
router.get("/verify", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isTutorProfileComplete: user.isTutorProfileComplete,
        authProviders: user.authProviders,
      },
    });
  } catch (error) {
    console.error("Verify auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Logout endpoint
router.post("/logout", csrfTokenGuard, (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;

