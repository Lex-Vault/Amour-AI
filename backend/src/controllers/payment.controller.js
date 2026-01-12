import crypto from "crypto";
import {
  razorpay,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} from "../config/razorPay.js";
import User from "../models/user.model.js";

const PRICING = {
  49: 12,
  149: 35,
  299: 70,
  199: 50,
  499: 160,
  999: 350,
};

export const createOrder = async (req, res) => {
  try {
    // amount expected in rupees (number or numeric string)
    const { amount, currency = "INR", credits, description } = req.body;
    const amountNumber = Number(amount);
    if (!amountNumber || isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ success: false, error: "invalid_amount" });
    }
    // amount in paise (integer)
    const amountPaise = Math.round(amountNumber * 100);
    const options = {
      amount: amountPaise,
      currency,
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        credits: String(credits ?? ""),
        description: description ?? "",
      },
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      order, // full razorpay order object (contains amount, currency, id)
      key: RAZORPAY_KEY_ID, // optional
    });
  } catch (err) {
    console.error("create-order error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amountRupees,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing params" });
    }

    // verify signature
    const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");
    const valid = generated_signature === razorpay_signature;

    const record = {
      id: Date.now(),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      verified: valid,
      amountRupees: amountRupees || null,
      receivedAt: new Date().toISOString(),
    };

    if (!valid) {
      console.warn("Payment signature verification failed", {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return res.status(400).json({ success: false, verified: false, record });
    }

    // --- crediting logic starts here ---
    // Require authenticated user to credit

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "authentication_required_to_credit",
        record,
      });
    }
    const creditsToAdd = PRICING[Number(amountRupees)] || 0;
    if (!creditsToAdd || isNaN(creditsToAdd) || creditsToAdd <= 0) {
      // No credits requested — still return success for verification but do not modify user
      return res.json({
        success: true,
        verified: true,
        record,
        creditsApplied: 0,
      });
    }

    // Atomic update: only apply if order id not already present in creditedOrders
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, creditedOrders: { $ne: razorpay_order_id } }, // condition
      {
        $inc: { credits: creditsToAdd }, // increment credits
      },
      { new: true } 
    ).lean();

    if (!updatedUser) {
      // The user was found but the order id already exists (or user not found)
      const existing = await User.findById(userId).lean();
      const currentCredits = existing?.credits ?? null;
      return res.json({
        success: true,
        verified: true,
        record,
        message: "order_already_applied_or_user_not_found",
        credits: currentCredits,
      });
    }

    // Success: credits added
    return res.json({
      success: true,
      verified: true,
      record,
      credits: updatedUser.credits,
    });
  } catch (err) {
    console.error("verify error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
