import jwt from "jsonwebtoken";

/* =========================
   REQUIRED AUTH
========================= */
export function authenticateToken(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token missing",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}
/* =========================
   OPTIONAL AUTH
========================= */
export function optAuthenticateToken(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    req.user = null;
  }
  next();
}