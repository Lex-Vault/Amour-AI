import axios from "axios";

//Analyze DP
export async function analyzeDp(base64Image: string) {
  if (!base64Image || typeof base64Image !== "string") {
    throw new Error("image_required");
  }
  const approxBytes = Math.floor((base64Image.length * 3) / 4);
  const MB = 1024 * 1024;
  if (approxBytes > 2.5 * MB) {
    // Not fatal — backend supports large payloads, but warn caller to consider multipart for reliability.
    console.warn(
      `analyzeDp: base64 payload is ~${(approxBytes / MB).toFixed(
        2
      )}MB. Consider using multipart upload (analyzeDpFile) to avoid hitting body size limits.`
    );
  }

  try {
    const resp = await axios.post(
      "api/ai/analyze-image",
      { base64Image },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const json = resp.data;

    if (!resp.status || resp.status < 200 || resp.status >= 300) {
      throw new Error(
        json?.error || `analyzeDp: ${resp.status} ${resp.statusText}`
      );
    }

    if (!json?.ok) {
      throw new Error(json?.error || "analyzeDp: unknown error");
    }

    return json.result;
  } catch (e) {
    if (e.response && e.response.data) {
      throw new Error(
        e.response.data.error ||
          `analyzeDp: ${e.response.status} ${e.response.statusText}`
      );
    }
    throw new Error(`analyzeDp: ${e.message}`);
  }
}


// Bio Generator
type BiosPayload = { hobbies: string; vibe: string; job?: string };

export async function generateBios(payload: BiosPayload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload_required");
  }
  const { hobbies, vibe, job } = payload;
  if (!hobbies || !vibe) {
    throw new Error("hobbies_vibe_required");
  }

  try {
    const resp = await axios.post(
      "/api/ai/generate-bios",
      { hobbies, vibe, job },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const json = resp.data;

    if (resp.status == 401) {
      return { unauthorized: true };
    }
    if (!resp.status || resp.status < 200 || resp.status >= 300) {
      throw new Error(
        json?.error || `generateBios: ${resp.status} ${resp.statusText}`
      );
    }

    if (!json?.ok) {
      throw new Error(json?.error || "generateBios: unknown error");
    }

    return json.result;
  } catch (e) {
    if (e.response && e.response.data) {
      throw new Error(
        e.response.data.error ||
          `generateBios: ${e.response.status} ${e.response.statusText}`
      );
    }
    throw new Error(`generateBios: ${e.message}`);
  }
}

// chat Analyzer (Text)
export async function analyzeChatText(chatText: string) {
  if (!chatText || typeof chatText !== "string") {
    throw new Error("chatText_required");
  }
  
  try {
    const resp = await axios.post("api/ai/analyze-chat", { chatText });
    const json = resp.data;
    
    if (!json?.ok) {
      throw new Error(json?.error || "analyzeChatText: unknown error");
    }
    
    return json.result;
  } catch (e) {
    if (e.response && e.response.data) {
      throw new Error(
        e.response.data.error ||
        `analyzeChatText: ${e.response.status} ${e.response.statusText}`
      );
    }
    throw new Error(`analyzeChatText: ${e.message}`);
  }
}

// chat Image Analyzer (Vision)
export async function analyzeChatImage(file: File) {
  if (!file) throw new Error("image_required");
  
  const fd = new FormData();
  fd.append("image", file);
  
  try {
    const resp = await axios.post("api/ai/analyze-chat-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const json = resp.data;

    if (!json?.ok) {
      throw new Error(json?.error || "analyzeChatImage: unknown error");
    }

    return json.result;
  } catch (e) {
    if (e.response && e.response.data) {
      throw new Error(
        e.response.data.error ||
          `analyzeChatImage: ${e.response.status} ${e.response.statusText}`
      );
    }
    throw new Error(`analyzeChatImage: ${e.message}`);
  }
}
