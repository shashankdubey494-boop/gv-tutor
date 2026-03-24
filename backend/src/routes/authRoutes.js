import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  signup,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  setPassword,
  changePassword,
  calculatePasswordStrength,
} from "../controllers/authController.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";
import { testBrevoDirectly } from "../controllers/testBrevoController.js";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import { getTokenCookieOptions, getTokenCookieClearOptions } from "../utils/cookieOptions.js";
import { issueCsrfToken } from "../middleware/csrfTokenGuard.js";

const router = express.Router();
const authRateLimit = rateLimiter(30, 15 * 60 * 1000);
const isDev = process.env.NODE_ENV !== "production";

router.post("/check-password-strength", (req, res) => {
  try {
    const { password } = req.body;
    const strength = calculatePasswordStrength(password);
    return res.json({
      success: true,
      ...strength,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking password strength",
    });
  }
});

// Disabled in production and limited to admin users in dev.
router.get(
  "/test-brevo",
  protect,
  (req, res, next) => {
    if (!isDev) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }
    return next();
  },
  testBrevoDirectly
);

router.get("/csrf-token", (req, res) => {
  const token = issueCsrfToken(res);
  return res.status(200).json({
    success: true,
    csrfToken: token,
  });
});

router.post("/signup", authRateLimit, signup);
router.post("/login", authRateLimit, login);
router.post("/forgot-password", authRateLimit, forgotPassword);
router.post("/verify-otp", authRateLimit, verifyOTP);
router.post("/reset-password", authRateLimit, resetPassword);
router.post("/set-password", authRateLimit, protect, setPassword);
router.post("/change-password", authRateLimit, protect, changePassword);

router.get("/verify", protect, async (req, res) => {
  try {
    const userWithPassword = await User.findById(req.user.userId).select("passwordHash");
    if (!userWithPassword) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findById(req.user.userId).select("-passwordHash");
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isTutorProfileComplete: user.isTutorProfileComplete,
        authProviders: user.authProviders,
        hasPassword: !!userWithPassword.passwordHash,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/google", (req, res, next) => {
  if (isDev) {
    console.log("Google OAuth initiation route hit");
  }

  const role = req.query.role || "user";
  const state = Buffer.from(JSON.stringify({ role })).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  const cookieOptions = getTokenCookieClearOptions();
  res.cookie("token", "", cookieOptions);
  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env.CLIENT_URL + "/login?error=google_auth_failed",
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(process.env.CLIENT_URL + "/login?error=no_user");
      }

      let roleFromState = "user";
      try {
        if (req.query.state) {
          const decoded = JSON.parse(Buffer.from(req.query.state, "base64").toString());
          roleFromState = decoded.role || "user";
        }
      } catch {
        roleFromState = "user";
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.redirect(process.env.CLIENT_URL + "/login?error=user_not_found");
      }

      let userProfile = await UserProfile.findOne({ userId: user._id });
      if (!userProfile) {
        const nameFromEmail = user.email.split("@")[0];
        userProfile = await UserProfile.create({
          userId: user._id,
          fullName: nameFromEmail,
          phone: "",
          address: "",
        });
        if (isDev) {
          console.log("Created UserProfile for Google OAuth user");
        }
      }

      if (roleFromState === "tutor" && user.role === "user") {
        user.role = "tutor";
        await user.save();
      }

      const token = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const cookieOptions = getTokenCookieOptions(24 * 60 * 60 * 1000);
      res.cookie("token", token, cookieOptions);

      const redirectUrl = process.env.CLIENT_URL + "/?auth=success&provider=google";
      return res.redirect(redirectUrl);
    } catch (error) {
      if (isDev) {
        console.error("Google OAuth callback error:", error);
      }
      return res.redirect(process.env.CLIENT_URL + "/login?error=server_error");
    }
  }
);

export default router;

