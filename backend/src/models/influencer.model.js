import mongoose from "mongoose";
const { Schema } = mongoose;

const InfluencerSchema = new Schema(
  {
    name: { type: String, required: true },
    referalLink: { type: String, required: true, unique: true },
    referralLinkExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    isActive: { type: Boolean, default: true },
    referralCount: { type: Number, default: 0 },
    contact: { type: String },
    totalEarning: { type: Number, default: 0 },
    pendingPayment: { type: Number, default: 0 },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default mongoose.model("Influencer", InfluencerSchema);
