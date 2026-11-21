import { Request, Response } from "express";
import taskModel from "./task.model.js";
import mongoose from "mongoose";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { title, description } = req.body;

    await taskModel.create({
      title,
      description,
      owner: userId,
    });

    res.status(201).json({
      message: "Task created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const tasks = await taskModel.find({
      owner: userId,
    });

    res.status(201).json({
      tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error!",
    });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const taskId = req.params.id;
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }
    const task = await taskModel.findById(taskId);

    if(!task){
      res.status(404).json({
        message: "Task not found!"
      });
    }

    if (task.owner.toString() !== userId) {
      res.status(403).json({
        message: "You are not the owner of this task."
      });
    }

    res.status(201).json({
      task
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error!",
    });
  }
};
