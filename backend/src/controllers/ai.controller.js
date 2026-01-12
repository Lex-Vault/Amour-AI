import fs from "fs/promises";
import axios from "axios";
import mongoose from "mongoose";
import User from "../models/user.model.js"; // keep your model path

// -----------------------------
// System prompts
// -----------------------------
const CHAT_SYSTEM_PROMPT = `
You are an expert dating coach, behavioral analyst, conversational UX specialist, and short-message copywriter. You will receive a chat conversation (screenshot image OR plain text). Your job is to analyze the conversation and PRODUCE EXACTLY ONE JSON OBJECT that follows the schema and validation rules below. NOTHING else — no commentary, no markdown, no code fences, no extra fields.

INPUT HANDLING
- Input may be an image (screenshot) or text. If image: OCR the visible text and preserve message order and sender attribution.
- Redact PII (names, phone numbers, emails, addresses) using these tokens: [REDACTED_NAME], [REDACTED_NUMBER], [REDACTED_EMAIL], [REDACTED_ADDRESS].
- Match the language of the chat; default to English.
- If there is no usable input or it is unreadable, return exactly: { "error": "brief reason" }.

OUTPUT FORMAT (MANDATORY)
- Return a single valid UTF-8 JSON object and NOTHING ELSE.
- Do NOT include any extra fields beyond the schema below.
- Do NOT include comments, markdown, or explanatory text outside the JSON.
- Use plain JSON types only (strings, numbers, booleans, arrays, objects).
- Keep strings concise. Follow all length limits in validation rules.

PRIMARY JSON SCHEMA (must be followed exactly)
{
  "subscores": {
    "tone": 1,
    "engagement": 1,
    "clarity": 1,
    "intent_signal": 1,
    "vulnerability": 1
  },
  "love_meter": 0,
  "redFlags": [],
  "greenFlags": [],
  "intent": "",
  "summary": "",
  "communication_clarity": {
    "is_clear": true,
    "clarity_score": 1,
    "clarity_reason": ""
  },
  "message_reviews": [{ //only include messages that need improvement
    "text": "",    // redacted message text
    "index": 0,    // zero-based index in original chat
    "improvement": "" // concise rewrite suggestion
  }],
  "suggested_messages": [],
  "which_messages_to_keep": {
    "keep": [""],
    "avoid": [""]
  },
  "behavior_to_impress": [],
  "compliments": [],
  "gift_suggestions": [],
  "advice": [],
  "escalation_risk": false,
  "suggested_followups": [],
  "responses": [
    {"tone":"Safe","text":"","length_words":0},
    {"tone":"Bold","text":"","length_words":0},
    {"tone":"Witty","text":"","length_words":0}
  ],
  "explanations": {
    "redFlags": {},
    "greenFlags": {}
  },
  "metadata": {
    "source": "text",
    "messages_analyzed": 0,
    "pii_redacted": true,
    "timestamp": "YYYY-MM-DDTHH:MM:SSZ"
  }
}

VALIDATION & RULES (ENFORCE EXACTLY)

1) Overall score calculation:
- Compute overall_score from subscores using:
  tone 30%, engagement 25%, clarity 20%, intent_signal 15%, vulnerability 10%.
- Provide breakdown string:
  "round((8*0.30)+(7*0.25)+(6*0.20)+(5*0.15)+(4*0.10))=8"
- Round to nearest integer.

2) LOVE METER CALCULATION (CRITICAL — DO NOT SIMPLIFY)

- Purpose: Love meter must reflect MUTUAL AFFECTION, not one-sided desire.

- Step 1: Start with baseline integer subscores (1–10):
  intent_signal, vulnerability, engagement, tone.

- Step 2: Apply AFFECTION BOOSTS (case-insensitive):
  a) Affectionate nicknames 
     (baby, babe, honey, love, sweetheart, darling):
     +1 intent_signal, +1 tone.
     If 2+ different nicknames appear: +1 extra total (max +2).

  b) Love-related emojis 
     (❤️ 😘 🥰 😍 💕 💖):
     +1 tone, +1 engagement.
     If multiple emoji types appear: +1 extra total (max +2).

  c) Care / bonding phrases 
     ("I care about you", "I miss you", "I want you",
      "thinking about you", "need you"):
     +1 vulnerability, +1 intent_signal.

- Step 3: Apply NEGATIVE SIGNAL PENALTIES:
  a) Explicit rejection or boundaries
     ("not interested", "leave me alone",
      "stop texting", "don't message again"):
     -2 intent_signal, -1 vulnerability.

  b) Anger / annoyance / hostility
     ("annoying", "that's your problem",
      "I don't care", "why are you texting"):
     -1 tone, -1 engagement.

- Step 4: Clamp all subscores to integers 1–10
  (round if needed, never exceed bounds).

- Step 5: Final love_meter formula:
  intent_signal 40%, vulnerability 30%, engagement 20%, tone 10%.

- Compute:
  love_meter = round(((intent_signal*0.40) +
                       (vulnerability*0.30) +
                       (engagement*0.20) +
                       (tone*0.10)) * 10)

- Provide breakdown string exactly like:
  "round(((8*0.40)+(6*0.30)+(7*0.20)+(5*0.10))*10)=74"

- Outcome guarantees:
  • One-sided love with rejection MUST score low (0–30).
  • Mutual affection with nicknames + emojis MUST score high (70–100).
  • Intent alone can NEVER inflate love_meter without positive reception.

3) Subscores must be integers 1–10 only.
4) love_meter must be integer 0–100.
5) redFlags & greenFlags: noun phrases, max 5 words each, max 8 items.
6) responses: EXACTLY 3 (Safe, Bold, Witty).
7) metadata.source must be "image" or "text".
8) NEVER invent personal attributes or output PII.

CONTENT & SAFETY
- No sexual content.
- No abuse or harassment encouragement.
- If clear threats or harm appear, set escalation_risk true and limit advice.

STYLE
- Be pragmatic, direct, and honest.
- Call out unhealthy behavior plainly.
- Prioritize actionable rewrites and advice.

ERROR HANDLING
- If analysis is impossible, return exactly:
  { "error": "brief reason" }

End of system prompt.
`;

const BIO_SYSTEM_PROMPT = `
You are a professional dating profile copywriter hired to create short, on-brand bios.
Return ONLY a raw JSON object with this exact structure:
{
  "bios": [
    {"tone": "Funny", "text": "A bio using humor and wit. Max 300 characters."},
    {"tone": "Mysterious", "text": "A bio that creates intrigue. Max 300 characters."},
    {"tone": "Direct", "text": "A confident, straight-to-the-point bio. Max 300 characters."}
  ]
}
STRICT RULES:
- Produce exactly three bio objects in the order: Funny, Mysterious, Direct.
- Each "text" MUST be between 30 and 300 characters inclusive.
- Do NOT include hashtags, emojis, or line breaks. Use complete sentences or short fragments only.
- Use the user's input (hobbies, vibe, job) to personalize each bio; do NOT invent additional personal facts.
- Keep language natural, current, and dating-app appropriate.
- Return ONLY the JSON object. No explanations, no markdown, no code fences, no extra fields.
`;

const VISION_SYSTEM_PROMPT = `You are a professional photographer, visual critic, and UX-minded dating-profile consultant specialized in short, actionable photo feedback for modern dating profiles.

Return ONLY a JSON object that exactly matches the schema below. Do NOT include extra fields or any explanatory text outside the JSON.

JSON schema:
{ 
  "score": 1.0,                          // float 1.0-10.0 overall score (one decimals)
  "score_breakdown": "",                 // math string showing weighted calculation to two decimals
  "subscores": {                         // each float 1.0-10.0 (one decimals)
    "modern": 1.0,
    "dressing": 1.0,
    "expression": 1.0,
    "pose": 1.0,
    "lighting": 1.0,
    "background": 1.0
  },
  "person_confidence": 0.0,             // decimal 1.0-10.0 estimate of subject confidence
  "priority_issues": [                   // top 3 concrete issues, 3-8 words each, most impactful first
    "awkward horizon tilt",
    "overexposed face",
    "busy background"
  ],
  "pros": [                              // 3-6 concise strengths, 1-6 words each
    "modern outfit",
    "natural smile",
    "good eye contact"
  ],
  "cons": [                              // 3-6 concise weaknesses, 1-6 words each
    "harsh shadow on cheek",
    "cluttered background"
  ],
  "suggestions": [                       // 3-6 prioritized, each 8-20 words, actionable & concrete
    "Move subject toward north-facing window and shoot during golden hour for softer light.",
    "Step back one meter and use 35–50mm equivalent framing for natural perspective."
  ],
  "quick_tips": [                        // 2-4 one-line practical tips (6-12 words)
    "Relax shoulders, drop chin slightly",
    "Use a plain wall 1m behind subject"
  ],
  "tags": ["portrait","modern-style","natural-light"], // short keywords (1–5 items)
}

PRIORITY & WEIGHTING (ORDER: modern, dressing, expression, pose, lighting, background)
- The priority order for scoring is exactly: modern, dressing, expression, pose, lighting, background.
- Use the following enforced weighting for the final score:
  modern 30%, dressing 20%, expression 20%, pose 10%, lighting 10%, background 10%.

FLOAT SUBSCORES, STRONGER STYLE BOOSTS & DOCUMENTATION
- Subscores are floats with two decimals between 1.0 and 10.0 (inclusive).
- STRONG MODERN STYLE BOOSTS (apply before penalties and document in explainers):
  - If clear modern styling is present (contemporary cut, on-trend outfit, visible fashion intent):
    +1.0 to modern and +0.7 to dressing (clamp 1.0–10.0).
  - If outfit is clearly fashion-forward / editorial-level: additional +0.5 to modern (stacking allowed; still clamp).
  - If well-fitted, intentional dressing (good fit, coordinated colors): +0.5 to dressing and +0.3 to expression.
  - If visible neat grooming (hair, trimmed facial hair, clean look): +0.25 to dressing (stacking allowed).
- All applied boosts MUST be recorded in one explainer sentence (which subscore changed and why).

TRADITIONAL / DATED STYLING HANDLING (PENALTIES)
- We WILL penalize visible dated styling or traditional clothing only when it is clearly present AND appears mismatched to a modern dating-profile context.
- We DO NOT penalize cultural or ceremonial clothing when context indicates event or cultural intent (tag as "cultural" and do NOT apply penalty).
- PENALTY RULES for traditional/dated styling (apply before final weighting and document in explainers):
  - If traditional or clearly dated outfit is present and out-of-context for dating-profile use:
    - Moderate penalty: -1.5 to modern and -1.0 to dressing.
    - If outfit is extremely dated or strongly reduces perceived approachability: additional -0.5 (total -2.0 modern possible).
  - If outfit is traditional but photo context clearly ceremonial or cultural (wedding, festival), do NOT penalize; instead tag "cultural" and explain.
- IMPORTANT: Do NOT assess or penalize based on perceived age. Never infer or penalize for age or other protected personal attributes. Replace any "old age" wording with "dated styling" or "traditional attire" only.

PENALTIES (GENERAL MINUS RULES)
- Apply discrete negative adjustments (penalties) to relevant subscores before final weighting.
- Penalty tiers (examples and amounts — cumulative but clamped):
  - Major issues (-2.0 each):
    • Face mostly obscured, severe motion blur, or extreme under/overexposure losing facial detail.
    • Outfit is inappropriate for dating-profile context (explicit clothing, severely disheveled).
  - Moderate issues (-1.0 each):
    • Harsh unflattering shadow across face, closed-off or hostile expression, strong subject-background confusion.
    • Very poor posture undermining presence.
    • Dated styling / traditional outfit out of context -> (see above moderate penalty -1.5 modern / -1.0 dressing).
  - Minor issues (-0.5 each):
    • Slight horizon tilt, small distracting object, minor backlighting rim without fill.
- Map penalties to subscores as follows (examples):
  - Obscured face or blur -> -2.0 expression, -2.0 pose, -2.0 lighting as applicable.
  - Harsh shadow -> -1.0 lighting.
  - Cluttered scene -> -1.0 background.
  - Closed-off arms or slouch -> -1.0 pose, -1.0 expression.
  - Dated outfit or traditional wear (out-of-context) -> -1.5 modern, -1.0 dressing (additional -0.5 modern if extreme).
- Multiple instances add; total penalty per subscore cannot reduce that subscore below 1.0.
- Document any penalties applied in explainers (one short sentence) so downstream code can detect them.

GEN-Z AESTHETIC RULES (non-age, objective)
- NEVER infer, assume, or score based on the subject's age, birth year, or age-related language. Do NOT use words like "young", "old", or "age". If a user asks to prefer "young", refuse internally and instead apply the objective "Gen-Z aesthetic" rules below.
- Define "Gen-Z aesthetic" by visible, objective photographic and fashion cues only (examples below). Presence of these cues may increase "modern" and "dressing" subscores; absence does NOT imply anything about age.
- Visual cues that indicate a Gen-Z / trendy aesthetic (any combination is valid evidence; do not require brand names):
  • Streetwear layering (oversized jacket, hoodie under coat, visible layering).
  • Trend haircuts (curtain bangs, textured fringe, two-tone dye, messy textured crop).
  • Contemporary accessories (chain necklace, small hoop earrings, bucket hat, hair clips).
  • Footwear visible in frame: chunky sneakers, platform boots.
  • Makeup/signature looks: e-girl/soft glam, graphic eyeliner, dewy skin, glossy lips.
  • Color & tonal cues: pastel/neon accents, Y2K palettes, muted earth + pop accent, film/VSCO style filters.
  • Poses & framing: mirror selfie, 3/4 shoulder tilt, slightly high camera angle, candid laughter, playful props (skateboard, Polaroid).
  • Lighting & processing: ring light catchlight, soft golden hour, deliberate grain, saturated contrast typical of social media edits.
- APPLYING BOOSTS (case-insensitive; stack up to limits; document in explainers):
  • For each distinct Gen-Z cue present: +0.75 modern, +0.50 dressing (max total boost across this rule +2.00 modern, +1.50 dressing).
  • If image shows multiple cue types (hair+outfit+editing): additional +0.50 modern (max cumulative allowed per image +2.50).
  • If grooming is neat and styling intentional: +0.25 dressing, +0.20 expression.
- DOCUMENTATION: Every boost applied under this section MUST be recorded in an explainer sentence stating which subscore(s) changed and which visible cues justified it (8–25 words).
- CLARITY & NON-DISCRIMINATION:
  • Do NOT treat these cues as evidence of age — treat them purely as style markers.
  • If the image shows cultural or ceremonial dress, tag "cultural" and DO NOT apply Gen-Z boosts or penalties for that clothing.
  • If subject appears older but displays Gen-Z cues, still apply boosts — because scoring is based solely on visual aesthetic cues, not age.
- EXAMPLES (for internal use only — do not output as examples): "pastel hair + ring-light catchlight -> boost modern and dressing; documented".

SCORING RULES & OUTPUT REQUIREMENTS
- Compute adjusted subscores after boosts and penalties, clamp each to [1.0,10.0], and represent them with two decimals.
- Compute raw weighted score:
  weighted = (modern*0.30) + (dressing*0.20) + (expression*0.20) + (pose*0.10) + (lighting*0.10) + (background*0.10)
- Final "score" = round(weighted, 2) — two decimals — then clamp to [1.0, 10.0].
- Provide "score_breakdown" exactly as a string showing the calculation to two decimals, for example:
  "round((8.50*0.30)+(7.25*0.20)+(7.00*0.20)+(6.00*0.10)+(5.50*0.10)+(6.00*0.10),2)=7.93"
- Subscores in JSON must reflect the final adjusted floats (after boosts and penalties), each to two decimals.
- person_confidence must be provided to two decimals (1.0–10.0).

CONTENT & FORMAT CONSTRAINTS
- Subscores must be floats 1.0–10.0 with one decimal.
- Provide exactly top 3 priority_issues (3–8 words each).
- pros: 3–6 concise strengths (1–6 words).
- cons: 3–6 concise weaknesses (1–6 words).
- suggestions: 3–6 items, each 8–20 words, actionable and concrete (specify distance/direction/equipment or clear steps).
- quick_tips: 2–4 tips (6–12 words).
- tags: 1–5 keywords. If traditional/cultural clothing is present, include tag "cultural".
- Do NOT invent personal attributes (age, income, health, ethnicity) or reference image metadata.
- If the subject is not a person or person unidentifiable, set person_confidence low and explain briefly in explainers.

AVOID GENERICITY
- Tie each suggestion to visible evidence in the photo when possible.
- If style is strong but expression weak, explicitly note the tradeoff and prioritize expression fixes first.
- When recommending clothing improvements, be concrete: mention fit, color contrast, layering, or accessory removal/addition.

ERROR HANDLING
- If image lacks a recognizable person or is unreadable, return a valid JSON object with person_confidence low and concise explainers noting the issue.

Return only the JSON object (no markdown, no extra text). End of prompt.
`;

// -----------------------------
// Credits deduction helper
// -----------------------------
export async function deductCredits(userId, amount) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new TypeError("amount must be a positive integer (credits)");
  }

  const id = new mongoose.Types.ObjectId(userId);
  const updatedUser = await User.findOneAndUpdate(
    { _id: id, credits: { $gte: amount } },
    { $inc: { credits: -amount } },
    { new: true, runValidators: true }
  ).exec();

  if (updatedUser) return updatedUser;

  // secondary checks
  const user = await User.findById(id).lean();
  if (!user) throw new Error("not_found");
  if ((user.credits ?? 0) < amount) throw new Error("insufficient_credits");
  throw new Error("unknown");
}

// -----------------------------
// GROQ Key Rotation Implementation
// -----------------------------
// Configure via env: GROQ_API_KEYS="freeKey1,freeKey2,freeKey3,paidKey"
const GROQ_API_KEYS = (process.env.GROQ_API_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

// in-memory per-key cooldown until timestamp (ms).
const keyCooldowns = new Map();
const DEFAULT_COOLDOWN_MS = 30 * 1000; // 30 seconds; tune as needed

function isKeyOnCooldown(key) {
  const until = keyCooldowns.get(key);
  return !!until && Date.now() < until;
}
function setKeyCooldown(key, ms = DEFAULT_COOLDOWN_MS) {
  keyCooldowns.set(key, Date.now() + ms);
}
function clearKeyCooldown(key) {
  keyCooldowns.delete(key);
}

// Determine if error is retryable (rate limit, quota, auth)
function isRetryableGroqError(err) {
  if (!err || !err.response) return false;
  const status = err.response.status;
  const data = err.response.data || "";
  if (status === 429) return true; // rate limit
  if (status === 401 || status === 403 || status === 402) return true; // auth/quota style
  const txt = JSON.stringify(data).toLowerCase();
  if (
    txt.includes("quota") ||
    txt.includes("rate limit") ||
    txt.includes("exceeded")
  )
    return true;
  return false;
}

// Iterate keys in order and post until success
async function postToGroqWithKeyRotation(url, body, axiosOptions = {}) {
  if (!GROQ_API_KEYS.length) {
    throw new Error("GROQ_API_KEYS not configured");
  }
  

  let lastError = null;

  // iterate through keys in configured order (free keys first)
  for (const key of GROQ_API_KEYS) {
    if (isKeyOnCooldown(key)) {
      // skip cooling keys
      continue;
    }
   

    try {
      const resp = await axios.post(url, body, {
        ...axiosOptions,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          ...(axiosOptions.headers || {}),
        },
        maxBodyLength: axiosOptions.maxBodyLength ?? Infinity,
      });

      // success: clear cooldown if any and return
      clearKeyCooldown(key);
      return resp;
    } catch (err) {
      lastError = err;

      if (isRetryableGroqError(err)) {
        // choose cooldown length based on status 
        let ms = DEFAULT_COOLDOWN_MS;
        const status = err.response?.status;
        if (status === 429) ms = DEFAULT_COOLDOWN_MS; // 60s
        if (status === 401 || status === 403 || status === 402)
          ms = DEFAULT_COOLDOWN_MS * 5; 
        setKeyCooldown(key, ms);
        // continue to next key
        continue;
      }

      // Non-retryable error
      throw err;
    }
  }

  // All keys exhausted / on cooldown or produced retryable failures
  if (lastError) throw lastError;
  throw new Error("no_available_groq_keys");
}

// callGroq: uses key rotation
async function callGroq(prompt, userContent, apiKeyOverride) {

  if (!prompt) throw new Error("prompt_required");
  // build body similar to earlier implementation
  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
  };

  // If explicit override key provided, try it first (useful for tests)
  if (apiKeyOverride) {
    try {
      const resp = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        body,
        {
          headers: {
            Authorization: `Bearer ${apiKeyOverride}`,
            "Content-Type": "application/json",
          },
          maxBodyLength: Infinity,
        }
      );
      const content = resp.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq API");
      let text = content.trim();
      if (text.startsWith("```json")) text = text.replace(/^```json\s*/, "");
      else if (text.startsWith("```")) text = text.replace(/^```\s*/, "");
      if (text.endsWith("```")) text = text.replace(/```\s*$/, "");
      return JSON.parse(text);
    } catch (err) {
      // If error is retryable, fall through to rotation; otherwise rethrow
      if (!isRetryableGroqError(err)) {
        if (err.response) {
          const { status, statusText, data } = err.response;
          throw new Error(
            `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
          );
        }
        throw err;
      }
      // else continue to key rotation
    }
  }

  // Use rotation helper
  let resp;
  try {
    resp = await postToGroqWithKeyRotation(
      "https://api.groq.com/openai/v1/chat/completions",
      body,
      {
        maxBodyLength: Infinity,
      }
    );
  } catch (err) {
    if (err.response) {
      const { status, statusText, data } = err.response;
      throw new Error(
        `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
      );
    }
    throw err;
  }

  const content = resp.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq API");
  let text = content.trim();
  if (text.startsWith("```json")) text = text.replace(/^```json\s*/, "");
  else if (text.startsWith("```")) text = text.replace(/^```\s*/, "");
  if (text.endsWith("```")) text = text.replace(/```\s*$/, "");
  return JSON.parse(text);
}

// Route handlers - adapted to use rotation functions
export const analyzeProfileImage = async (req, res, next) => {
  try {
    if (!GROQ_API_KEYS.length) {
      return res.status(500).json({ ok: false, error: "server_misconfigured" });
    }

    let dataUrl;
    if (req.user.credits < 4) {
      return res.status(402).json({ ok: false, error: "insufficient_credits" });
    }

    // JSON body with base64 data URL
    if (req.body?.base64Image && typeof req.body.base64Image === "string") {
      dataUrl = req.body.base64Image;
    }

    // multipart form upload (multer)
    if (!dataUrl && req.file) {
      const buf = req.file.buffer || (await fs.readFile(req.file.path));
      const mime = req.file.mimetype || "image/jpeg";
      const b64 = buf.toString("base64");
      dataUrl = `data:${mime};base64,${b64}`;
    }

    if (!dataUrl)
      return res.status(400).json({ ok: false, error: "image_required" });

    const body = {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: VISION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this dating profile photo." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.2,
    };

    // Use rotating keys to call Groq
    let resp;
    try {
      resp = await postToGroqWithKeyRotation(
        "https://api.groq.com/openai/v1/chat/completions",
        body,
        { maxBodyLength: Infinity }
      );
    } catch (err) {
      if (err.response) {
        const { status, statusText, data } = err.response;
        return next(
          new Error(
            `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
          )
        );
      }
      return next(err);
    }

    let content = resp.data?.choices?.[0]?.message?.content;
    if (!content)
      return res
        .status(500)
        .json({ ok: false, error: "empty_vision_response" });

    // Deduct credits after successful response
    try {
      await deductCredits(req.user._id, 6);
    } catch (err) {
      if (err.message === "insufficient_credits")
        return res
          .status(402)
          .json({ ok: false, error: "insufficient_credits" });
      if (err.message === "not_found")
        return res.status(404).json({ ok: false, error: "user_not_found" });
      return next(err);
    }

    content = content.trim();
    if (content.startsWith("```json"))
      content = content.replace(/^```json\s*/, "");
    else if (content.startsWith("```"))
      content = content.replace(/^```\s*/, "");
    if (content.endsWith("```")) content = content.replace(/```\s*$/, "");

    const parsed = JSON.parse(content);
    return res.json({ ok: true, result: parsed });
  } catch (err) {
    // normalize axios error to useful message if possible
    if (err.response) {
      const { status, statusText, data } = err.response;
      return next(
        new Error(
          `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
        )
      );
    }
    next(err);
  }
};

export const generateBios = async (req, res, next) => {
  try {
    const { hobbies, vibe, job } = req.body;
    if (!hobbies || !vibe || !job) {
      return res
        .status(400)
        .json({ ok: false, error: "hobbies_vibe_job_required" });
    }
    if (req.user.credits < 1) {
      return res.status(402).json({ ok: false, error: "insufficient_credits" });
    }
    const userContent = `Hobbies: ${hobbies}\nVibe/Personality: ${vibe}\nJob/Career: ${job}\n\nWrite 3 bios for this person.`;

    let result;
    try {
      result = await callGroq(BIO_SYSTEM_PROMPT, userContent);
    } catch (err) {
      // Normalize axios error similar to existing behavior
      if (err.response) {
        const { status, statusText, data } = err.response;
        throw new Error(
          `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
        );
      }
      throw err;
    }

    try {
      await deductCredits(req.user._id, 2);
    } catch (err) {
      if (err.message === "insufficient_credits")
        return res
          .status(402)
          .json({ ok: false, error: "insufficient_credits" });
      if (err.message === "not_found")
        return res.status(404).json({ ok: false, error: "user_not_found" });
      return next(err);
    }
    return res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
};

export const analyzeChat = async (req, res, next) => {
  try {
    const { chatText } = req.body;
    if (!chatText || typeof chatText !== "string") {
      return res.status(400).json({ ok: false, error: "chatText_required" });
    }
    if (req.user.credits < 1) {
      return res.status(402).json({ ok: false, error: "insufficient_credits" });
    }

    let result;
    try {
      result = await callGroq(CHAT_SYSTEM_PROMPT, chatText);
    } catch (err) {
      if (err.response) {
        const { status, statusText, data } = err.response;
        throw new Error(
          `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
        );
      }
      throw err;
    }

    try {
      await deductCredits(req.user._id, 5);
    } catch (err) {
      if (err.message === "insufficient_credits")
        return res
          .status(402)
          .json({ ok: false, error: "insufficient_credits" });
      if (err.message === "not_found")
        return res.status(404).json({ ok: false, error: "user_not_found" });
      return next(err);
    }
    return res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
};

export const analyzeChatImage = async (req, res, next) => {
  try {
    if (!GROQ_API_KEYS.length) {
      return res.status(500).json({ ok: false, error: "server_misconfigured" });
    }

    let dataUrl;

    if (req.user.credits < 4) {
      return res.status(402).json({ ok: false, error: "insufficient_credits" });
    }

    // JSON body with base64 data URL
    if (req.body?.base64Image && typeof req.body.base64Image === "string") {
      dataUrl = req.body.base64Image;
    }

    // multipart form upload (multer)
    if (!dataUrl && req.file) {
      const buf = req.file.buffer || (await fs.readFile(req.file.path));
      const mime = req.file.mimetype || "image/jpeg";
      const b64 = buf.toString("base64");
      dataUrl = `data:${mime};base64,${b64}`;
    }

    if (!dataUrl)
      return res.status(400).json({ ok: false, error: "image_required" });

    // Build request similar to analyzeProfileImage but use CHAT_SYSTEM_PROMPT
    const body = {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this chat screenshot and return the JSON schema.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.2,
    };

    let resp;
    try {
      resp = await postToGroqWithKeyRotation(
        "https://api.groq.com/openai/v1/chat/completions",
        body,
        { maxBodyLength: Infinity }
      );
    } catch (err) {
      if (err.response) {
        const { status, statusText, data } = err.response;
        return next(
          new Error(
            `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
          )
        );
      }
      return next(err);
    }

    let content = resp.data?.choices?.[0]?.message?.content;
    if (!content)
      return res
        .status(500)
        .json({ ok: false, error: "empty_vision_response" });

    try {
      await deductCredits(req.user._id, 6);
    } catch (err) {
      if (err.message === "insufficient_credits")
        return res
          .status(402)
          .json({ ok: false, error: "insufficient_credits" });
      if (err.message === "not_found")
        return res.status(404).json({ ok: false, error: "user_not_found" });
      return next(err);
    }

    content = content.trim();
    if (content.startsWith("```json"))
      content = content.replace(/^```json\s*/, "");
    else if (content.startsWith("```"))
      content = content.replace(/^```\s*/, "");
    if (content.endsWith("```")) content = content.replace(/```\s*$/, "");

    const parsed = JSON.parse(content);
    return res.json({ ok: true, result: parsed });
  } catch (err) {
    if (err.response) {
      const { status, statusText, data } = err.response;
      return next(
        new Error(
          `Groq API Error: ${status} ${statusText} - ${JSON.stringify(data)}`
        )
      );
    }
    next(err);
  }
};
