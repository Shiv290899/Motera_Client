export const readLocalUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const normalizeImageUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    if (host === "drive.google.com" || host === "docs.google.com" || host === "drive.usercontent.google.com") {
      const byPath = url.pathname.match(/^\/file\/d\/([^/]+)/i);
      const byQuery = url.searchParams.get("id");
      const fileId = byPath?.[1] || byQuery || "";
      if (fileId) {
        // Prefer lh3 CDN URL because uc/export now redirects to usercontent with CORP headers
        // that can block cross-site <img> rendering in browsers.
        return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1200`;
      }
    }

    if (host === "lh3.googleusercontent.com") {
      // Normalize to a stable display width suffix.
      const base = raw.replace(/=w\d+$/i, "");
      return `${base}=w1200`;
    }
  } catch {
    // Keep original value for non-URL strings; caller can handle invalid URLs.
  }

  return raw;
};

const shouldProxyGoogleImage_ = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  try {
    const url = new URL(raw);
    const host = String(url.hostname || "").toLowerCase();
    return (
      host === "lh3.googleusercontent.com" ||
      host === "drive.google.com" ||
      host === "docs.google.com" ||
      host === "drive.usercontent.google.com" ||
      host.endsWith(".googleusercontent.com")
    );
  } catch {
    return false;
  }
};

const resolveApiBase_ = () => {
  const envBase = String(import.meta?.env?.VITE_API_BASE_URL || "").trim();
  if (envBase) return envBase.replace(/\/+$/, "");
  try {
    const host = window?.location?.hostname || "";
    if (host.includes("localhost") || host.includes("127.0.0.1")) return "/api";
  } catch {
    // ignore
  }
  return "https://motera-api.onrender.com/api";
};

export const toRenderableImageUrl = (value) => {
  const normalized = normalizeImageUrl(value);
  if (!normalized) return "";
  if (!shouldProxyGoogleImage_(normalized)) return normalized;
  const apiBase = resolveApiBase_();
  return `${apiBase}/users/image-proxy?url=${encodeURIComponent(normalized)}`;
};

const extractGoogleFileId_ = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const byPathDrive = url.pathname.match(/^\/file\/d\/([^/]+)/i);
    const byPathLh3 = url.pathname.match(/^\/d\/([^=/?#]+)/i);
    const byQuery = url.searchParams.get("id");
    return String(byPathDrive?.[1] || byPathLh3?.[1] || byQuery || "").trim();
  } catch {
    return "";
  }
};

export const toGoogleImageFallbackUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const fileId = extractGoogleFileId_(raw);
    if (!fileId) return "";

    if (host === "lh3.googleusercontent.com") {
      return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;
    }
    if (host === "drive.google.com" || host === "docs.google.com" || host === "drive.usercontent.google.com") {
      return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1200`;
    }
    return "";
  } catch {
    return "";
  }
};

const isLikelyImageUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  if (/^data:image\//i.test(raw)) return true;
  try {
    const url = new URL(raw);
    const path = String(url.pathname || "").toLowerCase();
    if (/\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(path)) return true;
    const host = String(url.hostname || "").toLowerCase();
    if (host === "lh3.googleusercontent.com" || host === "drive.usercontent.google.com") return true;
    if (host === "api.qrserver.com" && path.includes("/create-qr-code")) return true;
    return false;
  } catch {
    return false;
  }
};

export const resolveLocationQrImageUrl = (value) => {
  const normalized = normalizeImageUrl(value);
  if (!normalized) return "";
  if (isLikelyImageUrl(normalized)) return toRenderableImageUrl(normalized);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(normalized)}`;
};

const DEFAULT_QUOTATION_WHATSAPP_TEMPLATE = Object.freeze({
  greetingLine: "*Hi {customerName}, Welcome to {showroomName}! 🏍️*",
  introLines: [
    "Multi-brand two-wheeler sales, service, spares, exchange, finance & insurance",
  ],
  contactLine: "*Mob No - {orgMobiles}*",
  locationsTitle: "*Our Locations* 📍",
  locations: ["{Organization Address}"],
  noteLine: "• *Note:* Prices are indicative and may change without prior notice.",
  closingLine: "✨ *{showroomName} — Ride with Pride, Drive with Confidence.* ✨",
});

const DEFAULT_FREE_FITTINGS_OPTIONS = Object.freeze([
  "All Round Guard",
  "Side Stand",
  "Ladies Foot Rest",
  "Grip Cover",
  "Seat Cover",
  "Floor Mat",
  "ISI Helmet",
]);

const DEFAULT_FREE_FITTINGS_SELECTED = Object.freeze([
  "Side Stand",
  "Grip Cover",
  "Floor Mat",
  "ISI Helmet",
]);

const toTrimmed = (value) => String(value || "").trim();
const normalizeLines = (value) => {
  if (Array.isArray(value)) return value.map((v) => toTrimmed(v)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\r?\n/g)
      .map((v) => toTrimmed(v))
      .filter(Boolean);
  }
  return [];
};

export const applyTemplatePlaceholders = (value, tokens = {}) => {
  const normalize = (k) => String(k || "").trim().toLowerCase().replace(/[\s_]+/g, "");
  const normalizedTokens = Object.keys(tokens || {}).reduce((acc, key) => {
    acc[normalize(key)] = tokens[key];
    return acc;
  }, {});
  return String(value || "").replace(/\{([^}]+)\}/g, (_, rawKey) => {
    const key = String(rawKey || "").trim();
    const direct = tokens[key];
    const byNormalized = normalizedTokens[normalize(key)];
    const v = direct !== undefined ? direct : byNormalized;
    return v === undefined || v === null ? "" : String(v);
  });
};

export const normalizeQuotationWhatsAppTemplate = (raw = {}) => {
  const d = DEFAULT_QUOTATION_WHATSAPP_TEMPLATE;
  const introLines = normalizeLines(raw?.introLines || raw?.introLine);
  const locations = normalizeLines(raw?.locations);
  return {
    greetingLine: d.greetingLine,
    introLines: introLines.length ? introLines : [...d.introLines],
    contactLine: d.contactLine,
    locationsTitle: d.locationsTitle,
    locations: locations.length ? locations : [...d.locations],
    noteLine: d.noteLine,
    closingLine: d.closingLine,
  };
};

export const normalizeOwnerFreeFittingsConfig = (raw = {}) => {
  const optionsRaw = Array.isArray(raw?.options)
    ? raw.options
    : Array.isArray(raw?.freeFittingsOptions)
    ? raw.freeFittingsOptions
    : [];
  const defaultsRaw = Array.isArray(raw?.defaultSelected)
    ? raw.defaultSelected
    : Array.isArray(raw?.freeFittingsDefaultSelected)
    ? raw.freeFittingsDefaultSelected
    : [];

  const seen = new Set();
  const options = optionsRaw
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .filter((v) => {
      const k = v.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

  const finalOptions = options.length ? options : [...DEFAULT_FREE_FITTINGS_OPTIONS];
  const defaults = defaultsRaw
    .map((v) => String(v || "").trim())
    .filter((v) => finalOptions.includes(v));
  const finalDefaults = defaults.length
    ? defaults
    : DEFAULT_FREE_FITTINGS_SELECTED.filter((v) => finalOptions.includes(v));

  return { options: finalOptions, defaultSelected: finalDefaults };
};

export const getOwnerConfig = () => {
  const u = readLocalUser();
  const role = String(u?.role || "").trim().toLowerCase();
  if (role === "owner") {
    // Owner is the top-level tenant; never read nested owner.ownerConfig.
    return u?.ownerConfig || u?.metadata?.ownerConfig || {};
  }
  return (
    u?.ownerConfig ||
    u?.metadata?.ownerConfig ||
    u?.owner?.ownerConfig ||
    {}
  );
};

const DEFAULT_OWNER_FLAT_INTEREST_RATE = 11;

export const getOwnerFlatInterestRate = () => {
  const cfg = getOwnerConfig() || {};
  const raw =
    cfg?.flatInterestRate ??
    cfg?.quotationFlatInterestRate ??
    cfg?.interestRate;
  const num = Number(raw);
  if (Number.isFinite(num) && num >= 0) return num;
  return DEFAULT_OWNER_FLAT_INTEREST_RATE;
};

const OWNER_SCOPED_ROLES = new Set([
  "owner",
  "staff",
  "mechanic",
  "callboy",
  "admin",
  "backend",
]);

const shouldEnforceOwnerWebhook_ = () => {
  const u = readLocalUser();
  const role = String(u?.role || "").trim().toLowerCase();
  return OWNER_SCOPED_ROLES.has(role);
};

const withOwnerModuleFromFallback_ = (ownerUrl, fallback) => {
  const base = String(ownerUrl || "").trim();
  if (!base) return "";
  const fb = String(fallback || "").trim();
  if (!/[?&]module=/.test(fb)) return base;
  const match = fb.match(/[?&]module=([^&]+)/i);
  const moduleKey = match?.[1] ? decodeURIComponent(match[1]) : "";
  if (!moduleKey) return base;
  if (/[?&]module=/.test(base)) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}module=${encodeURIComponent(moduleKey)}`;
};

export const getOwnerQuotationWhatsAppTemplate = () => {
  const cfg = getOwnerConfig();
  return normalizeQuotationWhatsAppTemplate({
    introLines: cfg?.quotationWaIntroLines,
    introLine: cfg?.quotationWaIntroLine,
    locations: cfg?.quotationWaLocations,
  });
};

export const getOwnerFreeFittingsConfig = () => {
  const cfg = getOwnerConfig();
  return normalizeOwnerFreeFittingsConfig({
    freeFittingsOptions: cfg?.freeFittingsOptions,
    freeFittingsDefaultSelected: cfg?.freeFittingsDefaultSelected,
  });
};

export const getOwnerLimits = () => {
  const u = readLocalUser();
  return u?.ownerLimits || u?.metadata?.ownerLimits || {};
};

export const getOwnerWebhookUrl = () => {
  const cfg = getOwnerConfig();
  let raw = String(cfg?.webhookUrl || '').trim();
  if (!raw) return '';
  // Common manual typo safeguards and mixed-content fixups.
  if (/^tps:\/\//i.test(raw)) raw = `h${raw}`;            // tps:// -> https://
  if (/^https\/\//i.test(raw)) raw = raw.replace(/^https\/\//i, 'https://'); // https// -> https://
  if (/^http\/\//i.test(raw)) raw = raw.replace(/^http\/\//i, 'http://');    // http// -> http://
  if (/^http:\/\//i.test(raw)) raw = raw.replace(/^http:\/\//i, 'https://'); // force https
  if (/^script\.google\.com\/macros\/s\//i.test(raw)) raw = `https://${raw}`; // missing scheme
  return raw;
};

export const getOwnerLogoUrl = () => {
  const cfg = getOwnerConfig();
  return toRenderableImageUrl(cfg?.logoUrl);
};

export const getTenantOwnerId = () => {
  try {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    const role = String(u?.role || "").toLowerCase();
    if (role === "owner") return String(u?._id || "");
    if (role === "admin" || role === "backend") return "";
    const owner = u?.owner;
    if (owner && typeof owner === "object" && owner._id) return String(owner._id);
    if (owner) return String(owner);
    return "";
  } catch {
    return "";
  }
};

export const getOwnerOrgName = () => {
  const cfg = getOwnerConfig();
  return String(cfg?.orgName || '').trim();
};

export const getOwnerOrgAddress = () => {
  const cfg = getOwnerConfig();
  return String(cfg?.orgAddress || '').trim();
};

export const getOwnerOrgAddressFontWeight = () => {
  const cfg = getOwnerConfig();
  const n = Number(cfg?.orgAddressFontWeight);
  return Number.isFinite(n) ? Math.min(900, Math.max(100, Math.round(n / 100) * 100)) : 600;
};

export const getOwnerOrgAddressFontSizePt = () => {
  const cfg = getOwnerConfig();
  const n = Number(cfg?.orgAddressFontSizePt);
  return Number.isFinite(n) ? Math.min(64, Math.max(8, n)) : 12;
};

export const getOwnerOrgNameRegional = () => {
  const cfg = getOwnerConfig();
  return String(cfg?.orgNameRegional || '').trim();
};

export const getOwnerOrgNameFontFamily = () => {
  const cfg = getOwnerConfig();
  return String(cfg?.orgNameFontFamily || '').trim();
};

export const getOwnerOrgNameRegionalFontFamily = () => {
  const cfg = getOwnerConfig();
  return String(cfg?.orgNameRegionalFontFamily || '').trim();
};

export const getOwnerOrgNameFontWeight = () => {
  const cfg = getOwnerConfig();
  const n = Number(cfg?.orgNameFontWeight);
  return Number.isFinite(n) ? Math.min(900, Math.max(100, Math.round(n / 100) * 100)) : 800;
};

export const getOwnerOrgNameRegionalFontWeight = () => {
  const cfg = getOwnerConfig();
  const n = Number(cfg?.orgNameRegionalFontWeight);
  return Number.isFinite(n) ? Math.min(900, Math.max(100, Math.round(n / 100) * 100)) : 800;
};

export const getOwnerOrgNameFontSizePt = () => {
  const cfg = getOwnerConfig();
  const n = Number(cfg?.orgNameFontSizePt);
  return Number.isFinite(n) ? Math.min(64, Math.max(8, n)) : 22;
};

export const getOwnerOrgNameRegionalFontSizePt = () => {
  const cfg = getOwnerConfig();
  const n = Number(cfg?.orgNameRegionalFontSizePt);
  return Number.isFinite(n) ? Math.min(64, Math.max(8, n)) : 23;
};

export const getOwnerOrgNameFontColor = () => {
  const cfg = getOwnerConfig();
  const v = String(cfg?.orgNameFontColor || "").trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : "#000000";
};

export const getOwnerOrgMobiles = () => {
  const cfg = getOwnerConfig();
  const raw = cfg?.orgMobiles;
  if (Array.isArray(raw)) return raw.map((v) => String(v || '').trim()).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(/[,\n;/|]+/g)
      .map((v) => String(v || '').trim())
      .filter(Boolean);
  }
  return [];
};

export const getOwnerMechanics = () => {
  const cfg = getOwnerConfig();
  const raw = cfg?.mechanics;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const name = String(item?.name || item || "").trim();
      const phone = String(item?.phone || item?.mobile || item?.contact || "").replace(/\D/g, "").slice(-10);
      return name ? { name, ...(phone ? { phone } : {}) } : null;
    })
    .filter(Boolean);
};

export const getOwnerLocationQrUrl = () => {
  const cfg = getOwnerConfig();
  return resolveLocationQrImageUrl(cfg?.locationQrUrl);
};

export const resolveWebhookUrl = (fallback) => {
  const ownerUrl = getOwnerWebhookUrl();
  if (shouldEnforceOwnerWebhook_()) return withOwnerModuleFromFallback_(ownerUrl, fallback);
  // If caller already resolved a module-specific URL, keep it.
  if (fallback && /[?&]module=/.test(String(fallback))) return String(fallback);
  return ownerUrl || fallback || "";
};

export const resolveUnifiedGasUrl = (moduleKey) => {
  const ownerUrl = getOwnerWebhookUrl();
  if (!ownerUrl) return "";
  if (!moduleKey) return ownerUrl;
  if (/[?&]module=/.test(ownerUrl)) return ownerUrl;
  const sep = ownerUrl.includes("?") ? "&" : "?";
  return `${ownerUrl}${sep}module=${encodeURIComponent(moduleKey)}`;
};

export const resolveLogoUrl = (fallback) => {
  const ownerUrl = getOwnerLogoUrl();
  return ownerUrl || toRenderableImageUrl(fallback) || "";
};
