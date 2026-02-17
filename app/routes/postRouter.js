import express from "express";
import {
  getPosts,
  getPostById,
  getPostBySlug
} from "../controllers/postController.js";

const router = express.Router();

// GET /api/v1/blog/posts
router.get("/", getPosts);
// GET /api/v1/blog/posts/id/:id
router.get("/id/:id", getPostById);
// GET /api/v1/blog/posts/slug/:slug
router.get("/slug/:slug", getPostBySlug);

export default router;
