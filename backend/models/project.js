import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    project_name: {
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
      enum: ["Pending", "Ongoing", "Completed", "Archived"],
      default: "Pending",
    },
    created_at: {
      type: Date,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    stages: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProjectStage",
      },
    ],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;