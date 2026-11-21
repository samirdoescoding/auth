import { model, Schema } from "mongoose";

export interface Session {
  user: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date;
  userAgent: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: {
      type: Date,
      default: null
    },
    userAgent: {
      type: String
    },
    ip: {
      type: String
    }
  },
  {
    timestamps: true,
  },
);

const sessionModel = model("Session", sessionSchema);

export default sessionModel;
