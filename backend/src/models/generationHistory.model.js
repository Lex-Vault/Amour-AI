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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 48, // TTL: 48 hours
  },
});

export default mongoose.model("GenerationHistory", GenerationHistorySchema);
