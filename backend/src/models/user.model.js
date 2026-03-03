import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, default: "User" },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, enum: ["male", "female", "prefer_not_to_say"], default: "prefer_not_to_say" },
  phoneVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  userType: { type: String, enum: ["free", "paid"], default: "free" },
  referredBy: { type: Schema.Types.ObjectId, ref: "Influencer", default: null },
  influencerCommissionPaid: { type: Boolean, default: false },
  adminAccess: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  credits: { type: Number, default: 4 },
  creditedOrders: { type: [String], default: [] },
});

export default mongoose.model("User", UserSchema);
