import express from "express";
import {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import {
  authenticateToken,
  optAuthenticateToken,
} from "../middleware/authenticate.js";
import rateLimit from "express-rate-limit";
const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
});
const router = express.Router();

router.get("/:postId", optAuthenticateToken, getCommentsByPostId);
router.post("/", commentLimiter, authenticateToken, createComment);
router.put("/:id", authenticateToken, updateComment);
router.delete("/:id", authenticateToken, deleteComment);

export default router;