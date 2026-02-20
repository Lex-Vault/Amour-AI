import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, default: "User" },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, enum: ["male", "female", "prefer_not_to_say"], default: "prefer_not_to_say" },
  phoneVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  referredBy: { type: String, default: null },
  adminAccess: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  credits: { type: Number, default: 4 },
  creditedOrders: { type: [String], default: [] },
});

export default mongoose.model("User", UserSchema);
