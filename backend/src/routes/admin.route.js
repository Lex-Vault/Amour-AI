import express from "express";
import { createInfluencer, listInfluencers, payNow } from "../controllers/admin.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// protect and require admin role

router.post("/create-influencer", isAdmin, createInfluencer);
router.get("/influencers", isAdmin, listInfluencers);
router.post("/influencers/:id/pay", isAdmin, payNow);

export default router;
