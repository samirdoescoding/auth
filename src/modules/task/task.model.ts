import { Schema, model } from "mongoose";

export interface Task {
  title: string;
  description: string;
  completed: boolean;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const taskModel = model("Task", taskSchema);

export default taskModel;