import Influencer from "../models/influencer.model.js";
import PaymentHistory from "../models/paymentHistory.model.js";
import mongoose from "mongoose";
import { generate } from "referral-codes";
import AiUsageStats from "../models/aiUsageStats.model.js";
/**
 * Create influencer
 */
export const createInfluencer = async (req, res, next) => {
  try {
    console.log(req.body);

    const {
      name,
      contact,
      referralCount = 0,
      totalEarning = 0,
      pendingPayment = 0,
    } = req.body;
    if (!name)
      return res.status(400).json({ ok: false, error: "name_required" });
    const referalLink = generate({
      prefix: "influ-",
      postfix: "2026",
    })[0];

    //parse referallink to string

    const infl = await Influencer.create({
      name,
      contact,
      referralCount,
      totalEarning,
      pendingPayment,
      referalLink,
    });
    return res.status(201).json({ ok: true, data: infl });
  } catch (err) {
    next(err);
  }
};

/**
 * List influencers (paginated + searchable)
 */
export const listInfluencers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const filter = {};
    
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Influencer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Influencer.countDocuments(filter),
    ]);
    return res.json({ ok: true, data: { items, total } });
  } catch (err) {
    next(err);
  }
};

/**
 * Pay now: decrement pendingPayment atomically, increment totalEarning, create PaymentHistory entry.
 * Body: { amount, paymentMethod?, note? }
 */
export const payNow = async (req, res, next) => {
  try {
    const influencerId = req.params.id;
    const adminId = req.user?.id || req.user?._id;
    const { amount, paymentMethod = "manual", note = "" } = req.body;

    const numeric = Number(amount);
    if (!numeric || isNaN(numeric) || numeric <= 0) {
      return res.status(400).json({ ok: false, error: "invalid_amount" });
    }

    // atomic: only decrement if pendingPayment >= amount
    const updated = await Influencer.findOneAndUpdate(
      { _id: influencerId, pendingPayment: { $gte: numeric } },
      {
        $inc: { pendingPayment: -numeric, totalEarning: numeric },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    ).lean();

    if (!updated) {
      // might be insufficient pending amount or influencer not found
      const maybe = await Influencer.findById(influencerId).lean();
      if (!maybe)
        return res
          .status(404)
          .json({ ok: false, error: "influencer_not_found" });
      return res.status(400).json({
        ok: false,
        error: "insufficient_pending_payment",
        pendingPayment: maybe.pendingPayment,
      });
    }

    // record audit
    await PaymentHistory.create({
      influencerId,
      amount: numeric,
      paymentMethod,
      note,
      adminId,
      createdAt: new Date(),
    });

    return res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * List query logs (generation history) for admin dashboard.
 * Recent logs come from GenerationHistory (last 48h).
 * Aggregate totals come from permanent AiUsageStats collection.
 */
export const listQueryLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const filter = {};
    if (type && type !== "all") filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const GenerationHistory = mongoose.model("GenerationHistory");

    // Fetch recent logs (within 48h window) and permanent totals in parallel
    const statsFilter = (type && type !== "all") ? type : "_all";

    const [items, total, permanentStats] = await Promise.all([
      GenerationHistory
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "username phone")
        .lean(),
      GenerationHistory.countDocuments(filter),
      AiUsageStats.findOne({ type: statsFilter }).lean(),
    ]);

    const totals = permanentStats || { totalCostINR: 0, totalTokens: 0, totalRequests: 0 };

    return res.json({
      ok: true,
      data: {
        items,
        total,
        page: Number(page),
        totals: {
          costINR: Number((totals.totalCostINR || 0).toFixed(4)),
          tokens: totals.totalTokens || 0,
          requests: totals.totalRequests || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
