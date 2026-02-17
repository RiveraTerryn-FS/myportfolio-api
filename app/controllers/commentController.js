import Comment from "../models/comment.js";

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "username")
      .select("content createdAt user likes");
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
export const getCommentsByPostId = async (req, res, next) => {
  try {
    const { postId } = req.params;
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
    const { content } = req.body;
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
    comment.content = content;
    await comment.save();
    const populated = await comment.populate("user", "username");
    res.status(200).json(populated);
  } catch (err) {
    next(err);
  }
};
export const createComment = async (req, res, next) => {
  try {
    const { content, post } = req.body;
    if (!content || !post) {
      return res.status(400).json({
        success: false,
        error: "Content and post are required",
      });
    }
    const comment = await Comment.create({
      content,
      post,
      user: req.user.id,
    });
    const populated = await comment.populate("user", "username");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};