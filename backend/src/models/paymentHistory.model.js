import mongoose from "mongoose";
const { Schema } = mongoose;

const PaymentHistorySchema = new Schema({
  influencerId: {
    type: Schema.Types.ObjectId,
    ref: "Influencer",
    required: true,
  },
  amount: { type: Number, required: true }, // amount paid (positive number)
  paymentMethod: { type: String, default: "manual" }, // client said manual; allow strings
  note: { type: String },
  adminId: { type: Schema.Types.ObjectId, ref: "User" }, // who recorded it
  createdAt: { type: Date, default: () => new Date() },
  razorpayOrderId: { type: String }, // optional
  metadata: { type: Object, default: {} },
});

export default mongoose.model("PaymentHistory", PaymentHistorySchema);
