import { sendOtp, verifyOtp } from "../services/twilio.service.js";
import { normalizeAndValidatePhone } from "../utils/phoneNormalize.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { getCookieOptions, COOKIE_NAME } from "../utils/cookieConfig.js";
import influencerModel from "../models/influencer.model.js";

// Simple sanitization: strip HTML tags and limit length
const sanitizeString = (str, maxLength = 50) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>"'&]/g, "") // Remove potentially dangerous characters
    .trim()
    .slice(0, maxLength);
};

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
      username: sanitizeString(username, 50),
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

    const token = generateToken(user);
    const cookieOptions = getCookieOptions();
    res.cookie(COOKIE_NAME, token, cookieOptions);

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

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);
    const cookieOptions = getCookieOptions();
    res.cookie(COOKIE_NAME, token, cookieOptions);

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
    const { phone, intent } = req.body;

    if (!phone)
      return res.status(400).json({ ok: false, error: "phone_required" });

    const normalized = normalizeAndValidatePhone(phone);
    if (!normalized) {
      return res.status(400).json({ ok: false, error: "invalid_phone" });
    }

    // Check user existence based on intent to prevent wasted OTPs
    const existingUser = await User.findOne({ phone: normalized });

    if (intent === "signup" && existingUser) {
      return res.status(400).json({
        ok: false,
        error: "user_already_exists",
        message: "This phone number is already registered. Please login instead.",
      });
    }

    if (intent === "login" && !existingUser) {
      return res.status(404).json({
        ok: false,
        error: "user_not_found",
        message: "No account found with this phone number. Please signup first.",
      });
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
  // Use same cookie options (except maxAge) for proper clearing across browsers
  const cookieOptions = getCookieOptions();
  res.clearCookie(COOKIE_NAME, {
    path: cookieOptions.path,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    httpOnly: cookieOptions.httpOnly,
  });
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
