import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import {
  listPlans,
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  handleWebhook,
} from "../controllers/subscription.controller.js";
import { protectRoute } from "../middleware/protectRoutes.js";

const router = express.Router();

// Legacy one-time payment (kept for backward compat)
router.post("/create-order", protectRoute, createOrder);
router.post("/verify-payment", protectRoute, verifyPayment);

// Subscription routes (protected)
router.get("/plans", listPlans);
router.post("/create-subscription", protectRoute, createSubscription);
router.post("/cancel-subscription", protectRoute, cancelSubscription);
router.get("/subscription-status", protectRoute, getSubscriptionStatus);

// Webhook (NOT protected — Razorpay calls this, signature verification inside)
router.post("/webhook", handleWebhook);

export default router;
