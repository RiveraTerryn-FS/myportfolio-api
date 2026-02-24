import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import sanitizeHtml from "sanitize-html";
import mongoose from "mongoose";

export const getCommentsByPostId = async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid post ID",
      });
    }
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "username");
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid comment ID",
      });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }
    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }
    await comment.deleteOne();
    res.status(200).json({
      success: true,
      message: "Comment deleted",
    });
  } catch (err) {
    next(err);
  }
};
export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid comment ID",
      });
    }
    const { content } = req.body;
    const comment = await Comment.findById(id);
    const cleanContent = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {},
    });
    if (!cleanContent.trim()) {
      return res.status(400).json({
        success: false,
        error: "Comment cannot be empty",
      });
    }
    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }
    comment.content = cleanContent;
    await comment.save();
    const populated = await comment.populate("user", "username");
    res.status(200).json({
      success: true,
      comment: populated,
    });
  } catch (err) {
    next(err);
  }
};
export const createComment = async (req, res, next) => {
  try {
    const { content, post } = req.body;
    if (!post || !mongoose.Types.ObjectId.isValid(post)) {
      return res.status(400).json({
        success: false,
        error: "Invalid post ID",
      });
    }

    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }
    const cleanContent = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {},
    });
    if (!cleanContent.trim()) {
      return res.status(400).json({
        success: false,
        error: "Comment cannot be empty",
      });
    }
    const comment = await Comment.create({
      content: cleanContent,
      post,
      user: req.user.id,
    });
    const populated = await comment.populate("user", "username");

    res.status(201).json({
      success: true,
      comment: populated,
    });
  } catch (err) {
    next(err);
  }
};