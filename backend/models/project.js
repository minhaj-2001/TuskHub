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






// // backend/models/project.js
// import mongoose from "mongoose";

// const projectSchema = new mongoose.Schema({
//   project_name: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String
//   },
//   status: {
//     type: String,
//     enum: ['Pending', 'Ongoing', 'Completed', 'Archived'],
//     default: 'Pending'
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   },
//   stages: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'ProjectStage'
//   }]
// }, { timestamps: true });

// // Add a pre-save hook to automatically update status based on stages
// projectSchema.pre('save', function(next) {
//   // If stages array is being modified
//   if (this.isModified('stages')) {
//     if (this.stages && this.stages.length > 0) {
//       // If project has stages, set status to Ongoing (unless it's already Completed or Archived)
//       if (this.status !== 'Completed' && this.status !== 'Archived') {
//         this.status = 'Ongoing';
//       }
//     } else {
//       // If no stages, set status to Pending (unless it's Archived)
//       if (this.status !== 'Archived') {
//         this.status = 'Pending';
//       }
//     }
//   }
//   next();
// });

// const Project = mongoose.model("Project", projectSchema);

// export default Project;










// // backend/models/project.js
// import mongoose from "mongoose";

// const projectSchema = new mongoose.Schema({
//   project_name: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String
//   },
//   status: {
//     type: String,
//     enum: ['Pending', 'Ongoing', 'Completed', 'Archived'],
//     default: 'Pending'
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   },
//   stages: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'ProjectStage'
//   }]
// }, { timestamps: true });

// const Project = mongoose.model("Project", projectSchema);

// export default Project;



// import mongoose from "mongoose";

// const projectSchema = new mongoose.Schema({
//   project_name: { type: String, required: true },
//   description: { type: String },
//   status: { 
//     type: String, 
//     enum: ['Pending', 'Ongoing', 'Completed', 'Archived'], 
//     default: 'Pending' 
//   },
//   created_at: { type: Date, default: Date.now }
// }, { timestamps: true });

// const Project = mongoose.model("Project", projectSchema);

// export default Project;