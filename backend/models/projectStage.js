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
      required: true,
    },
    start_date: {
      type: Date,
    },
    completion_date: {
      type: Date,
    },
    order: {
      type: Number,
      required: true,
    },
    connections: [
      {
        type: Schema.Types.ObjectId,
        ref: "StageConnection",
      },
    ],
  },
  { timestamps: true }
);

const ProjectStage = mongoose.model("ProjectStage", projectStageSchema);

export default ProjectStage;






// // backend/models/projectStage.js
// import mongoose from "mongoose";

// const projectStageSchema = new mongoose.Schema({
//   project: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Project",
//     required: true
//   },
//   stage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Stage",
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['Ongoing', 'Completed'],
//     required: true
//   },
//   start_date: {
//     type: Date,
//     required: function() { return this.status === 'Ongoing'; }
//   },
//   completion_date: {
//     type: Date,
//     required: function() { return this.status === 'Completed'; }
//   },
//   order: {
//     type: Number,
//     required: true
//   },
//   connections: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'StageConnection'
//   }]
// }, { timestamps: true });

// const ProjectStage = mongoose.model("ProjectStage", projectStageSchema);
// export default ProjectStage;





// // backend/models/projectStage.js
// import mongoose from "mongoose";

// const projectStageSchema = new mongoose.Schema({
//   project: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Project",
//     required: true
//   },
//   stage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Stage",
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['Ongoing', 'Completed'],
//     required: true
//   },
//   start_date: {
//     type: Date,
//     required: function() { return this.status === 'Ongoing'; }
//   },
//   completion_date: {
//     type: Date,
//     required: function() { return this.status === 'Completed'; }
//   },
//   order: {
//     type: Number,
//     required: true
//   },
//   connections: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'StageConnection'
//   }]
// }, { timestamps: true });

// const ProjectStage = mongoose.model("ProjectStage", projectStageSchema);

// export default ProjectStage;