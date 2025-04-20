// src/model/User.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  profileUrl: { type: String, default: "" }, // Ensure defaulta
  role: { type: String, enum: ["admin", "user"], default: "user" },
  active: { type: Boolean, default: true }, // Add active field
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = mongoose.model("User", userSchema);
