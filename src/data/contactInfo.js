export const SALES_NUMBERS = ["9019844809"];

export const SALES_PRIMARY = "9019844809";
export const SALES_SECONDARY = "";

export const SALES_DISPLAY = "+91 90198 44809";

const normalizeTel = (num) => {
  const digits = String(num || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("91")) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

export const SALES_TEL_LINK = (() => {
  const normalized = normalizeTel(SALES_PRIMARY);
  return normalized ? `tel:+${normalized}` : "";
})();

export const SALES_WHATSAPP_LINK = (() => {
  const normalized = normalizeTel(SALES_PRIMARY);
  return normalized ? `https://wa.me/${normalized}` : "";
})();

export const BUSINESS_HOURS = "Mon-Sat: 9:00 AM - 8:30 PM - Sun: 9:00 AM - 2:30 PM";
export const CONTACT_EMAIL = "kumarmar869@gmail.com";
