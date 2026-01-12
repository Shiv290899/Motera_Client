import { axiosInstance } from "./index";

const getOwnerWebAppUrl = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?.owner?.webAppUrl || user?.owner?.web_app_url || user?.ownerWebAppUrl || user?.webAppUrl || "";
  } catch {
    return "";
  }
};

const resolveWebhookUrl = (webhookUrl, fallbackModule) => {
  const base = getOwnerWebAppUrl();
  if (!base) return webhookUrl;
  try {
    const baseUrl = new URL(base);
    let moduleName = fallbackModule;
    if (!moduleName && webhookUrl) {
      try {
        const incoming = new URL(webhookUrl);
        moduleName = incoming.searchParams.get("module") || moduleName;
        incoming.searchParams.forEach((value, key) => {
          if (key !== "module") baseUrl.searchParams.set(key, value);
        });
      } catch {
        // ignore invalid incoming url
      }
    }
    if (moduleName) baseUrl.searchParams.set("module", moduleName);
    return baseUrl.toString();
  } catch {
    return webhookUrl || base;
  }
};

export { getOwnerWebAppUrl, resolveWebhookUrl as resolveOwnerWebhookUrl };

export const saveQuotationForm = async (payload) => {
  const resolved = resolveWebhookUrl(payload?.webhookUrl, "quotation");
  const { data } = await axiosInstance.post("/forms/quotation", { ...(payload || {}), webhookUrl: resolved });
  return data;
};

export const getNextQuotationSerial = async () => {
  const { data } = await axiosInstance.get("/forms/quotation/next-serial");
  return data;
};
export const reserveQuotationSerial = async (mobile, branchCode, branchId) => {
  const { data } = await axiosInstance.post("/forms/quotation/serial/reserve", { mobile, branchCode, branchId });
  return data;
};

export const saveJobCardForm = async (payload) => {
  const resolved = resolveWebhookUrl(payload?.webhookUrl, "jobcard");
  const { data } = await axiosInstance.post("/forms/jobcard", { ...(payload || {}), webhookUrl: resolved });
  return data;
};

export const getNextJobcardSerial = async () => {
  const { data } = await axiosInstance.get("/forms/jobcard/next-serial");
  return data;
};
export const reserveJobcardSerial = async (mobile, branchCode, branchId) => {
  const { data } = await axiosInstance.post("/forms/jobcard/serial/reserve", { mobile, branchCode, branchId });
  return data;
};

export const saveBookingForm = async (payload) => {
  const resolved = resolveWebhookUrl(payload?.webhookUrl, "booking");
  const { data } = await axiosInstance.post("/forms/booking", { ...(payload || {}), webhookUrl: resolved });
  return data;
};

export const saveBookingViaWebhook = async ({ webhookUrl, payload, headers, method, module }) => {
  const resolved = resolveWebhookUrl(webhookUrl, module || "booking");
  const { data } = await axiosInstance.post("/forms/booking/webhook", { webhookUrl: resolved, payload, headers, method }, { timeout: 60000 });
  return data;
};

// Jobcard-specific webhook proxy (separate from booking for clarity)
export const saveJobcardViaWebhook = async ({ webhookUrl, payload, headers, method, module }) => {
  const resolved = resolveWebhookUrl(webhookUrl, module || "jobcard");
  const { data } = await axiosInstance.post("/forms/jobcard/webhook", { webhookUrl: resolved, payload, headers, method });
  return data;
};

export const saveStockMovementForm = async (payload) => {
  const resolved = resolveWebhookUrl(payload?.webhookUrl, "stocks");
  const { data } = await axiosInstance.post("/forms/stock", { ...(payload || {}), webhookUrl: resolved });
  return data;
};
