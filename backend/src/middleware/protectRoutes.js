import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies && req.cookies["amour"];

    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ ok: false, error: "no_auth_token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ ok: false, error: "invalid_token" });
    }

    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      return res.status(401).json({ ok: false, error: "user_not_found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
};
