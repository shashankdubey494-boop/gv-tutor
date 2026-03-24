import express from "express";
import { notificationService } from "../notifications/index.js";
import { protect } from "../src/middleware/authMiddleware.js";

const router = express.Router();

const tutorOnly = (req, res, next) => {
  if (req.user?.role !== "tutor") {
    return res.status(403).json({
      success: false,
      message: "Tutor access required",
    });
  }
  return next();
};

router.get("/tutor/notifications", protect, tutorOnly, async (req, res) => {
  try {
    const tutorId = req.user.userId;
    const notifications = await notificationService.getTutorNotifications(tutorId);
    const unreadCount = await notificationService.getUnreadCount(tutorId);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

router.put("/tutor/notifications/:notificationId/read", protect, tutorOnly, async (req, res) => {
  try {
    const tutorId = req.user.userId;
    const { notificationId } = req.params;

    await notificationService.markAsRead(tutorId, notificationId);

    return res.json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark as read",
    });
  }
});

export default router;

