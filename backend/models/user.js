import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    is2FAEnabled: { type: Boolean, default: false },
    twoFAOtp: { type: String, select: false },
    twoFAOtpExpires: { type: Date, select: false },
    role: {
      type: String,
      enum: ["manager", "user"],
      default: "manager",
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralLink: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate referral link before saving
userSchema.pre("save", function (next) {
  if (this.role === "manager" && !this.referralLink) {
    this.referralLink = `${process.env.FRONTEND_URL}/sign-up?ref=${this._id}`;
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;








// import mongoose, { Schema } from "mongoose";

// const userSchema = new Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },
//     password: { type: String, required: true, select: false },
//     name: { type: String, required: true, trim: true },
//     profilePicture: { type: String },
//     isEmailVerified: { type: Boolean, default: false },
//     lastLogin: { type: Date },
//     is2FAEnabled: { type: Boolean, default: false },
//     twoFAOtp: { type: String, select: false },
//     twoFAOtpExpires: { type: Date, select: false },
//   },
//   { timestamps: true }
// );
// const User = mongoose.model("User", userSchema);

// export default User;
