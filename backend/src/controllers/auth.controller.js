import { sendOtp, verifyOtp } from "../services/twilio.service.js";
import { normalizeAndValidatePhone } from "../utils/phoneNormalize.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import influencerModel from "../models/influencer.model.js";

export const signupController = async (req, res, next) => {
  try {
    const { username, phone, otp ,ref } = req.body;
    
    if (!username || !phone || !otp) {
      return res
        .status(400)
        .json({ ok: false, error: "username_and_phone_and_otp_required" });
    }
    const normalized = normalizeAndValidatePhone(phone);
    const existingUser = await User.findOne({ phone: normalized });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: "user_already_exists" });
    }
    const result = await verifyOtp(normalized, otp);

    if (result.status !== "approved") {
      return res.status(400).json({ ok: false, error: "invalid_otp" });
    }
    const now = new Date();
    let user = await User.create({
      username,
      phone: normalized,
      phoneVerified: true,
      createdAt: now,
      lastLoginAt: now,
    });

    if (ref) {
      // Handle referral logic here
      const referrer = await influencerModel.findOne({ referalLink: ref });
      if (referrer) {
        referrer.referralCount += 1;
        await referrer.save();
      }
    }

    const token = generateToken(user, res);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 90 * 24 * 60 * 60 * 1000,
      path: "/",
    };
    res.cookie("amour", token, cookieOptions);

    return res.json({
      ok: true,
      data: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res
        .status(400)
        .json({ ok: false, error: "phone_and_otp_required" });

    const normalized = normalizeAndValidatePhone(phone);
    const user = await User.findOne({ phone: normalized });
    if (!user) {
      return res.status(404).json({ ok: false, error: "user_not_found" });
    }

    const result = await verifyOtp(normalized, otp);
    if (result.status !== "approved") {
      return res.status(400).json({ ok: false, error: "invalid_otp" });
    }

    const token = generateToken(user, res);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 90 * 24 * 60 * 60 * 1000,
      path: "/",
    };
    res.cookie("amour", token, cookieOptions);

    return res.status(200).json({
      ok: true,
      data: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const sendOtpController = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone)
      return res.status(400).json({ ok: false, error: "phone_required" });

    const normalized = normalizeAndValidatePhone(phone);
    if (!normalized) {
      return res.status(400).json({ ok: false, error: "invalid_phone" });
    }

    try {
      await sendOtp(normalized); // your existing Twilio wrapper
      return res.status(200).json({ ok: true, data: { message: "otp_sent" } });
    } catch (twErr) {
      console.warn("Twilio sendOtp error", twErr?.message || twErr);
      const status = twErr?.status || 502;
      const code = twErr?.code || "sms_provider_error";
      return res.status(status === 400 ? 400 : 502).json({
        ok: false,
        error: "sms_send_failed",
        providerCode: code,
        message: twErr?.message || "failed to send otp",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const logoutController = (_, res) => {
  res.clearCookie("amour", { path: "/" });
  res.json({ ok: true, message: "logged out" });
};

export const getMeController = (req, res) => {
  return res.status(200).json({
    ok: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      phone: req.user.phone,
      phoneVerified: req.user.phoneVerified,
      credits: req.user.credits,
      adminAccess: req.user.adminAccess,
    },
  });
};
