import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true, 
      index: true 
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { 
      type: String, 
      enum: ["admin", "user"], // Aapne kaha ek admin aur baaki user
      default: "user", 
    },
    isVerified: {
  type: Boolean,
  default: false
},
    // 🔥 OTP Logic ke liye naye fields
    otp: { type: String, select: false }, 
    otpExpires: { type: Date, select: false },
    avatar: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);