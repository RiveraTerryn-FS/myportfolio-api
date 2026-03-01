import express from "express";
import commentRouter from "./commentRouter.js";
import authRouter from "./authRouter.js";
import postRouter from "./postRouter.js";
import adminRouter from "./adminRouter.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: `${req.method} - Request made`,
    success: true,
  });
});

router.use("/admin", adminRouter);
router.use("/auth", authRouter);
router.use("/blog/comments", commentRouter);
router.use("/blog/posts", postRouter);

export default router;