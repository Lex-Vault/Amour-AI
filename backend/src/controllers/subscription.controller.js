import crypto from "crypto";
import {
  razorpay,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} from "../config/razorPay.js";
import User from "../models/user.model.js";
import Influencer from "../models/influencer.model.js";

// -------------------------------------------------------
// Plan configuration
// After running scripts/createRazorpayPlans.js, paste the
// Razorpay plan IDs here.
// -------------------------------------------------------
const PLANS = {
  weekly_lite:   { razorpayPlanId: "plan_SRLdNhkFIkP5Be", price: 49,  credits: 12,  label: "Weekly Lite" },
  weekly_plus:   { razorpayPlanId: "plan_SRLdOWLm3hzptI", price: 149, credits: 35,  label: "Weekly Plus" },
  weekly_pro:    { razorpayPlanId: "plan_SRLdPEzTX8qTLS", price: 299, credits: 70,  label: "Weekly Pro" },
  monthly_lite:  { razorpayPlanId: "plan_SRLdQ9oX6GUjAe", price: 199, credits: 50,  label: "Monthly Lite" },
  monthly_plus:  { razorpayPlanId: "plan_SRLdQzxp5kPTmj", price: 499, credits: 160, label: "Monthly Plus" },
  monthly_pro:   { razorpayPlanId: "plan_SRLdRqxAX1XBpk", price: 999, credits: 350, label: "Monthly Pro" },
};

// -------------------------------------------------------
// GET /api/payment/plans — list available plans
// -------------------------------------------------------
export const listPlans = (req, res) => {
  const plans = Object.entries(PLANS).map(([key, p]) => ({
    key,
    label: p.label,
    price: p.price,
    credits: p.credits,
    period: key.startsWith("weekly") ? "weekly" : "monthly",
  }));
  return res.json({ ok: true, data: plans });
};

// -------------------------------------------------------
// POST /api/payment/create-subscription
// Body: { planKey: "weekly_plus" }
// -------------------------------------------------------
export const createSubscription = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ ok: false, error: "auth_required" });
    }

    const { planKey } = req.body;
    const plan = PLANS[planKey];
    if (!plan || !plan.razorpayPlanId) {
      return res.status(400).json({ ok: false, error: "invalid_plan" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: "user_not_found" });
    }

    // If user already has an active subscription, cancel it first
    if (
      user.subscription?.razorpaySubscriptionId &&
      ["active", "authenticated", "created"].includes(user.subscription?.status)
    ) {
      try {
        await razorpay.subscriptions.cancel(user.subscription.razorpaySubscriptionId);
      } catch (cancelErr) {
        console.warn("Failed to cancel old subscription:", cancelErr.message);
      }
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      total_count: 520, // max cycles (10 years weekly / ~43 years monthly)
      customer_notify: 1,
      notes: {
        userId: String(userId),
        planKey,
        credits: String(plan.credits),
      },
    });

    // Save subscription info on user
    await User.findByIdAndUpdate(userId, {
      $set: {
        "subscription.razorpaySubscriptionId": subscription.id,
        "subscription.planKey": planKey,
        "subscription.status": subscription.status,
        "subscription.creditsPerCycle": plan.credits,
      },
    });

    return res.json({
      ok: true,
      data: {
        subscriptionId: subscription.id,
        key: RAZORPAY_KEY_ID,
        amount: plan.price * 100, // paise
        currency: "INR",
        name: "Amour AI",
        description: `${plan.label} — ${plan.credits} credits`,
      },
    });
  } catch (err) {
    console.error("create-subscription error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// -------------------------------------------------------
// POST /api/payment/cancel-subscription
// -------------------------------------------------------
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ ok: false, error: "auth_required" });
    }

    const user = await User.findById(userId);
    if (!user?.subscription?.razorpaySubscriptionId) {
      return res.status(400).json({ ok: false, error: "no_active_subscription" });
    }

    // Cancel at end of current cycle (cancel_at_cycle_end: 0 = immediate)
    await razorpay.subscriptions.cancel(user.subscription.razorpaySubscriptionId, {
      cancel_at_cycle_end: 0,
    });

    // Zero credits immediately per client requirement
    await User.findByIdAndUpdate(userId, {
      $set: {
        credits: 0,
        "subscription.status": "cancelled",
      },
    });

    return res.json({ ok: true, message: "subscription_cancelled" });
  } catch (err) {
    console.error("cancel-subscription error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// -------------------------------------------------------
// GET /api/payment/subscription-status
// -------------------------------------------------------
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ ok: false, error: "auth_required" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ ok: false, error: "user_not_found" });
    }

    const sub = user.subscription || {};
    const plan = PLANS[sub.planKey] || null;

    return res.json({
      ok: true,
      data: {
        active: sub.status === "active",
        status: sub.status || null,
        planKey: sub.planKey || null,
        planLabel: plan?.label || null,
        credits: user.credits,
        creditsPerCycle: sub.creditsPerCycle || 0,
        currentPeriodEnd: sub.currentPeriodEnd || null,
      },
    });
  } catch (err) {
    console.error("subscription-status error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// -------------------------------------------------------
// POST /api/payment/webhook  (called by Razorpay)
// -------------------------------------------------------
export const handleWebhook = async (req, res) => {
  try {
    // 1. Verify signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers["x-razorpay-signature"];

    if (webhookSecret && receivedSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest("hex");

      if (expectedSignature !== receivedSignature) {
        console.warn("Webhook signature mismatch");
        return res.status(400).json({ error: "invalid_signature" });
      }
    }

    // 2. Parse event
    const event = req.body.event;
    const payload = req.body.payload;
    const subscriptionEntity = payload?.subscription?.entity;
    const paymentEntity = payload?.payment?.entity;

    console.log(`[Webhook] Event: ${event}, Sub ID: ${subscriptionEntity?.id}`);

    if (!subscriptionEntity?.id) {
      return res.status(200).json({ ok: true, message: "ignored" });
    }

    // Find user by subscription ID
    const user = await User.findOne({
      "subscription.razorpaySubscriptionId": subscriptionEntity.id,
    });

    if (!user) {
      // Could be from notes
      const userId = subscriptionEntity.notes?.userId;
      if (userId) {
        const userFromNotes = await User.findById(userId);
        if (userFromNotes) {
          await handleSubscriptionEvent(event, subscriptionEntity, paymentEntity, userFromNotes);
          return res.status(200).json({ ok: true });
        }
      }
      console.warn("Webhook: no user found for subscription", subscriptionEntity.id);
      return res.status(200).json({ ok: true, message: "user_not_found" });
    }

    await handleSubscriptionEvent(event, subscriptionEntity, paymentEntity, user);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Always return 200 to Razorpay to prevent retries on our errors
    return res.status(200).json({ ok: false, error: err.message });
  }
};

// -------------------------------------------------------
// Internal: handle subscription events
// -------------------------------------------------------
async function handleSubscriptionEvent(event, subEntity, paymentEntity, user) {
  const userId = user._id;
  const planKey = user.subscription?.planKey;
  const plan = PLANS[planKey] || {};
  const credits = plan.credits || user.subscription?.creditsPerCycle || 0;

  switch (event) {
    // Subscription activated (first payment successful)
    case "subscription.activated": {
      await User.findByIdAndUpdate(userId, {
        $set: {
          "subscription.status": "active",
          "subscription.currentPeriodEnd": subEntity.current_end
            ? new Date(subEntity.current_end * 1000)
            : null,
          userType: "paid",
          credits: credits,
        },
      });

      // First-purchase influencer commission
      if (user.referredBy && !user.influencerCommissionPaid) {
        const commissionAmount = Math.round(plan.price * 0.10);
        if (commissionAmount > 0) {
          await Influencer.findByIdAndUpdate(user.referredBy, {
            $inc: { pendingPayment: commissionAmount },
          });
          await User.findByIdAndUpdate(userId, {
            $set: { influencerCommissionPaid: true },
          });
        }
      }

      console.log(`[Webhook] Subscription activated for user ${userId}, +${credits} credits`);
      break;
    }

    // Recurring payment charged (credits added each cycle)
    case "subscription.charged": {
      const paymentId = paymentEntity?.id;

      // Idempotency: check if we already processed this payment
      if (paymentId && user.creditedOrders?.includes(paymentId)) {
        console.log(`[Webhook] Payment ${paymentId} already processed, skipping`);
        break;
      }

      await User.findByIdAndUpdate(userId, {
        $set: {
          credits: credits, // Reset to plan credits each cycle
          "subscription.status": "active",
          "subscription.currentPeriodEnd": subEntity.current_end
            ? new Date(subEntity.current_end * 1000)
            : null,
        },
        ...(paymentId ? { $addToSet: { creditedOrders: paymentId } } : {}),
      });

      console.log(`[Webhook] Subscription charged for user ${userId}, credits reset to ${credits}`);
      break;
    }

    // Subscription cancelled
    case "subscription.cancelled": {
      await User.findByIdAndUpdate(userId, {
        $set: {
          credits: 0,
          "subscription.status": "cancelled",
        },
      });
      console.log(`[Webhook] Subscription cancelled for user ${userId}, credits zeroed`);
      break;
    }

    // Payment failed after retries → halted
    case "subscription.halted": {
      await User.findByIdAndUpdate(userId, {
        $set: {
          credits: 0,
          "subscription.status": "halted",
        },
      });
      console.log(`[Webhook] Subscription halted for user ${userId}, credits zeroed`);
      break;
    }

    // Pending payment (retry in progress)
    case "subscription.pending": {
      await User.findByIdAndUpdate(userId, {
        $set: { "subscription.status": "pending" },
      });
      console.log(`[Webhook] Subscription pending for user ${userId}`);
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event: ${event}`);
  }
}
