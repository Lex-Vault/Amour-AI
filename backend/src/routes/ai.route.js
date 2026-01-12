import express from "express";
import multer from "multer";
import {
  analyzeChat,
  analyzeChatImage,
  analyzeProfileImage,
  generateBios,
} from "../controllers/ai.controller.js";

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Analyze chat
router.post("/analyze-chat", analyzeChat);

// Generate bios
router.post("/generate-bios", generateBios);

// Analyze image — accepts base64 in JSON or multipart file upload
router.post("/analyze-image", upload.single("image"), analyzeProfileImage);
// Analyze chat screenshot — accepts base64 in JSON or multipart file upload
router.post("/analyze-chat-image", upload.single("image"), analyzeChatImage);

export default router;
