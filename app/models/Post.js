import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 55,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    type: {
      type: String,
      default: "notes",
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
