import mongoose, { Schema } from "mongoose";

const projectStageSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    stage: {
      type: Schema.Types.ObjectId,
      ref: "Stage",
      required: true,
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
  },
  { timestamps: true }
);

const ProjectStage = mongoose.model("ProjectStage", projectStageSchema);
export default ProjectStage;