import mongoose from "mongoose";
const { Schema } = mongoose;

const InfluencerSchema = new Schema(
  {
    name: { type: String, required: true },
    referalLink: { type: String, required: true, unique: true },
    referralCount: { type: Number, default: 0 },
    contact: { type: String }, // flexible (email or phone) -- consider validation later
    totalEarning: { type: Number, default: 0 }, // in rupees (or smallest currency unit depending on app)
    pendingPayment: { type: Number, default: 0 }, // amount waiting to be paid
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default mongoose.model("Influencer", InfluencerSchema);
