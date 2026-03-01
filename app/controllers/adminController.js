import User from "../models/User.js";
/* =========================
   GET USERS
========================= */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const showInactive = req.query.showInactive === "true";
    const query = {
      ...(showInactive ? {} : { active: true }),
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      success: true,
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};
/* =========================
   SOFT DELETE (BAN USER)
========================= */
export const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot delete yourself",
      });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User banned",
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to ban user",
    });
  }
};
/* =========================
   RESTORE USER
========================= */
export const restoreUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
    ).select("-password -refreshTokens");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User restored",
      user,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to restore user",
    });
  }
};
/* =========================
   UPDATE USER
========================= */
export const updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    if (req.user.id === req.params.id && role && role !== "admin") {
      return res.status(400).json({
        success: false,
        error: "You cannot change your own role",
      });
    }
    const updates = {};
    if (username) updates.username = username.toLowerCase();
    if (email) updates.email = email.toLowerCase();
    if (role && ["user", "admin"].includes(role)) {
      updates.role = role;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -refreshTokens");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
};