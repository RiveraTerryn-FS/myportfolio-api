import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  newJti,
  refreshCookieOptions,
} from "../utils/authToken.js";
// REGISTER
export const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: "Username, email address, and password required",
      });
    }
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

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "development"
        ? false
        : true,
      sameSite: "lax",
    });
    return res.status(201).json({
      success: true,
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
    const user = await User.findOne({ username }).select("+password");
    if (!user)
      return res.status(401).json({ success: false, error: "Incorrect username or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, error: "Incorrect username or password" });
    const accessToken = signAccessToken(user);
    const jti = newJti();
    const refreshToken = signRefreshToken(user, jti);
    user.refreshTokens.push({ jti });
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
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
  const token = req.cookies?.refreshToken;
  if (!token)
    return res.status(401).json({ success: false, error: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const { id, jti } = decoded;
    const user = await User.findById(id);
    if (!user)
      return res.status(401).json({ success: false, error: "Invalid session" });
    const exists = user.refreshTokens.some((t) => t.jti === jti);
    if (!exists)
      return res.status(401).json({ success: false, error: "Session revoked" });
    user.refreshTokens = user.refreshTokens.filter((t) => t.jti !== jti);
    const newTokenId = newJti();
    user.refreshTokens.push({ jti: newTokenId });
    await user.save();

    const newRefreshToken = signRefreshToken(user, newTokenId);
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
    const newAccessToken = signAccessToken(user);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({ success: true });
  } catch {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired refresh token",
    });
  }
};
// LOGOUT
export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  res.clearCookie("refreshToken", refreshCookieOptions);
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t.jti !== decoded.jti
        );
        await user.save();
      }
    } catch { }
  }
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