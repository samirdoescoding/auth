import { Request, Response } from "express";
import postModel from "./post.model.js";
import mongoose from "mongoose";

export const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        message: "Unauthorized!",
      });
    }

    const { title, content } = req.body;
    await postModel.create({
      title,
      content,
      author: user.userId,
    });

    return res.status(201).json({
      message: "Post created successfully",
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        message: "Unauthorized!",
      });
    }

    const posts = await postModel.find({
      author: user.userId,
    });

    return res.status(201).json({
      posts,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {

    const user = req.user;
    if (!user) {
      return res.status(403).json({
        message: "Unauthorized!",
      });
    }

    const postId = req.params.id;
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid post id",
      });
    }

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    if (post.author.toString() !== user?.userId) {
      return res.status(403).json({
        message: "You are not the owner of this post.",
      });
    }

    return res.status(201).json({
      post,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error!",
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    type Post = {
      title?: string;
      content?: string;
    }

    const user = req.user;
    const postId = req.params.id;
    const body: Post = req.body;

    // 1. If the id is invalid
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid post id",
      });
    }

    // 2. Find the task and make sure the right owner
    const post = await postModel.findById(postId);
    if(!post){
      return res.status(404).json({
        message: "Post not found!"
      });
    }
    if (post.author.toString() !== user?.userId) {
      return res.status(403).json({
        message: "You are not the owner of this post."
      });
    }

    // 3. update
    await postModel.findByIdAndUpdate(
      postId,
      body,
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(201).json({
      message: "Post updated successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        message: "Unauthorized!",
      });
    }

    const postId = req.params.id;
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const post = await postModel.findById(postId);

    if(!post){
      return res.status(404).json({
        message: "Post not found!"
      });
    }

    if (
      post.author.toString() !== user?.userId &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can not delete this post!"
      });
    }

    await post.deleteOne({ _id: postId });

    return res.status(201).json({
      message: "Post deleted successfully!"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};
