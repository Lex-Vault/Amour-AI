import express from "express";
import rateLimit from "express-rate-limit";
import {
  getMeController,
  loginController,
  logoutController,
  sendOtpController,
  signupController,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoutes.js";

const router = express.Router();

// Rate limiter for OTP endpoint to prevent abuse
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: { ok: false, error: "too_many_otp_requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", signupController);

router.post("/login", loginController);

router.post("/send-otp", otpLimiter, sendOtpController);

router.post("/logout", logoutController);

router.get("/me", protectRoute, getMeController);

export default router;
