import mongoose from "mongoose";

/**
 * Permanent aggregate stats for AI usage.
 * Single document per `type` (or "_all" for global totals).
 * Incremented atomically on every AI generation — survives GenerationHistory TTL.
 */
const AiUsageStatsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["_all", "bio", "profile_analysis", "chat_analysis", "chat_image_analysis"],
    required: true,
    unique: true,
    index: true,
  },
  totalRequests: { type: Number, default: 0 },
  totalPromptTokens: { type: Number, default: 0 },
  totalCompletionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  totalCostINR: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("AiUsageStats", AiUsageStatsSchema);
