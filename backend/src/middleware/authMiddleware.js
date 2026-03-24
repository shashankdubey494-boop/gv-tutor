import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback for privacy browsers where cookie auth can fail.
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    return next();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Token verification failed:", err.message);
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

