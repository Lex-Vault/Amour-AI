import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, default: "User" },
  phone: { type: String, required: true, unique: true },
  phoneVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  refferredBy: { type: String, default: null },
  adminAccess: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  credits: { type: Number, default: 4 },
});

export default mongoose.model("User", UserSchema);
