// backend/models/customProjectStage.js
import mongoose, { Schema } from "mongoose";

const customProjectStageSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    stage_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Ongoing", "Completed"],
      default: "Ongoing",
    },
    start_date: {
      type: Date,
    },
    completion_date: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const CustomProjectStage = mongoose.model("CustomProjectStage", customProjectStageSchema);
export default CustomProjectStage;