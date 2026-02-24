import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  newJti,
  refreshCookieOptions,
} from "../utils/authToken.js";
import { body, validationResult } from "express-validator";

export const validateLogin = [
  body("username")
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 }),

  body("password")
    .isString()
    .isLength({ min: 6, max: 100 }),
];
export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  body("username")
    .isString()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores."),

  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];
// REGISTER
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    let { username, password, email } = req.body;

    username = username.toLowerCase();
    email = email.toLowerCase();
    const exists = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "Username or email already exists",
      });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashed,
    });
    const accessToken = signAccessToken(user);
    const jti = newJti();
    const refreshToken = signRefreshToken(user, jti);

    user.refreshTokens.push({ jti });
    await user.save();
    res.cookie("refreshToken", refreshToken, refreshCookieOptions); /* <-- Refresh cookie */

    return res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
// LOGIN
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const identifier = username.toLowerCase();
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Incorrect username or password",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: "Incorrect username or password",
      });
    }
    const accessToken = signAccessToken(user);
    const jti = newJti();
    const refreshToken = signRefreshToken(user, jti);
    user.refreshTokens.push({ jti });
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
// REFRESH TOKEN
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false });
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false });
    }
    const accessToken = signAccessToken(user);
    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch {
    return res.status(401).json({ success: false });
  }
};
// LOGOUT
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t.jti !== decoded.jti
        );
        await user.save();
      }
    } catch { }
  }
  res.clearCookie("refreshToken", refreshCookieOptions); /* <-- Clear fresh cookie */
  return res.status(200).json({ success: true });
};
/* USER */
export const user = async (req, res) => {
  const dbUser = await User.findById(req.user.id).select(
    "username email role"
  );
  if (!dbUser) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }
  res.status(200).json({
    user: {
      id: dbUser._id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
    },
  });
};