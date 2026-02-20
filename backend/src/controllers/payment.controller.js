import crypto from "crypto";
import {
  razorpay,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} from "../config/razorPay.js";
import User from "../models/user.model.js";

const PRICING = {
  99: 10,
  249: 30,
  449: 55,
  699: 90,
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
      { _id: userId, creditedOrders: { $ne: razorpay_order_id } },
      {
        $inc: { credits: creditsToAdd },
        $addToSet: { creditedOrders: razorpay_order_id },
      },
      { new: true }
    ).lean(); 

    if (!updatedUser) {
      // The order was already applied or user not found
      const existing = await User.findById(userId).lean();
      if (!existing)
        return res.json({
          success: true,
          verified: true,
          record,
          message: "user_not_found",
          credits: null,
        });
      return res.json({
        success: true,
        verified: true,
        record,
        message: "order_already_applied",
        credits: existing.credits,
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
