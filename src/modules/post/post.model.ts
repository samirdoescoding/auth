import { Schema, model } from "mongoose";

export interface Post {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const postModel = model("Post", postSchema);

export default postModel;