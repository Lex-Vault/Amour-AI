import { parsePhoneNumberFromString } from "libphonenumber-js";

// helper
export function normalizeAndValidatePhone(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();

  // If user provided a +country format, parse without fallback; otherwise assume IN (India)
  const pn = trimmed.startsWith("+")
    ? parsePhoneNumberFromString(trimmed)
    : parsePhoneNumberFromString(trimmed, "IN");

  if (!pn || !pn.isValid()) return null;
  return pn.number; // E.164 string like "+911234567890"
}
