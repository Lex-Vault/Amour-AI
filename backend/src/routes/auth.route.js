import express from "express";
import User from "../models/user.model.js";

import jwt from "jsonwebtoken";
import {
  getMeController,
  loginController,
  logoutController,
  sendOtpController,
  signupController,
} from "../controllers/auth.controller.js";

const router = express.Router();

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.amour;
    if (!token)
      return res.status(401).json({ ok: false, error: "no_auth_token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-password");
    if (!user)
      return res.status(401).json({ ok: false, error: "invalid_token" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
};
router.post("/signup", signupController);

router.post("/login", loginController);

router.post("/send-otp", sendOtpController);

router.post("/logout", logoutController);

router.get("/me", checkAuth, getMeController);

export default router;
