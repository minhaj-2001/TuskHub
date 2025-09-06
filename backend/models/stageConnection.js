// backend/models/stageConnection.js
import mongoose from "mongoose";

const stageConnectionSchema = new mongoose.Schema({
  from_stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectStage",
    required: true
  },
  to_stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectStage",
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  }
}, { timestamps: true });

const StageConnection = mongoose.model("StageConnection", stageConnectionSchema);
export default StageConnection;