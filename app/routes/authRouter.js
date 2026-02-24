import express from "express";
import {
  login,
  register,
  refresh,
  logout,
  user,
  validateLogin,
  validateRegister,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authenticate.js";
import rateLimit from "express-rate-limit";


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many registration attempts. Please try again later.",
    });
  },
});
const router = express.Router();

router.get("/user", authenticateToken, user);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/login", loginLimiter, validateLogin, login);
router.post("/register", registerLimiter, validateRegister, register);

export default router;