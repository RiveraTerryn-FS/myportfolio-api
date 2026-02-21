import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

export const getPosts = async (req, res, next) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username")
      .select("title content createdAt likes user type summary views slug");
    const total = await Post.countDocuments();
    const postsWComments = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({
          post: post._id,
        });
        return {
          ...post.toObject(),
          commentsCount: commentCount,
        };
      })
    );
    res.status(200).json({
      posts: postsWComments,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + postsWComments.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("user", "username")
      .select("title content createdAt likes user type summary views slug");
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }
    const commentCount = await Comment.countDocuments({
      post: post._id,
    });
    const postWithComments = {
      ...post.toObject(),
      commentsCount: commentCount,
    };
    return res.status(200).json(postWithComments);
  } catch (err) {
    next(err);
  }
};
export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("user", "username")
      .select("title content createdAt likes user type summary views slug");
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }
    const commentCount = await Comment.countDocuments({
      post: post._id,
    });
    const postWithComments = {
      ...post.toObject(),
      commentsCount: commentCount,
    };

    return res.status(200).json(postWithComments);
  } catch (err) {
    next(err);
  }
};