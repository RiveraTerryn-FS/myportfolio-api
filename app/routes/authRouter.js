import express from "express";
import {
  login,
  register,
  refresh,
  logout,
  user,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/user", authenticateToken, user);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/login", login);
router.post("/register", register);

export default router;