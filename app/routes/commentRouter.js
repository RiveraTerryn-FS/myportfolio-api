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

const router = express.Router();

router.get("/:postId", optAuthenticateToken, getCommentsByPostId);
router.post("/", authenticateToken, createComment);
router.put("/:id", authenticateToken, updateComment);
router.delete("/:id", authenticateToken, deleteComment);

export default router;
