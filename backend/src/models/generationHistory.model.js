import mongoose from "mongoose";

const GenerationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["bio", "profile_analysis", "chat_analysis", "chat_image_analysis"],
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed, // Can be object or string depending on valid input
    default: null,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  model: {
    type: String,
    default: null,
  },
  tokenUsage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  costINR: {
    type: Number, // cost in INR (paisa-level precision)
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 48, // TTL: auto-delete after 48 hours
  },
});

export default mongoose.model("GenerationHistory", GenerationHistorySchema);
