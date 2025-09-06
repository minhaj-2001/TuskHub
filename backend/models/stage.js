import mongoose, { Schema } from "mongoose";

const stageSchema = new Schema(
  {
    stage_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    projectSpecific: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  { timestamps: true }
);

const Stage = mongoose.model("Stage", stageSchema);
export default Stage;




















// import mongoose, { Schema } from "mongoose";

// const stageSchema = new Schema(
//   {
//     stage_name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const Stage = mongoose.model("Stage", stageSchema);

// export default Stage;






// // backend/models/stage.js
// import mongoose from "mongoose";

// const stageSchema = new mongoose.Schema({
//   stage_name: { 
//     type: String, 
//     required: true 
//   },
//   description: { 
//     type: String 
//   },
// }, { 
//   timestamps: true 
// });

// const Stage = mongoose.model("Stage", stageSchema);
// export default Stage;








// import mongoose from "mongoose";

// const stageSchema = new mongoose.Schema({
//   stage_name: { type: String, required: true },
//   description: { type: String },
// }, { timestamps: true });

// const Stage = mongoose.model("Stage", stageSchema);

// export default Stage;