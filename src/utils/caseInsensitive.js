export const normalizeKey = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value || "")
    .trim()
    .normalize("NFKD")
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  return str;
};

export const normalizeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
};

export const uniqCaseInsensitive = (values) => {
  const seen = new Map();
  (Array.isArray(values) ? values : []).forEach((v) => {
    const normalized = normalizeText(v);
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) seen.set(key, normalized);
  });
  return Array.from(seen.values());
};

export const toKeySet = (values) => {
  const set = new Set();
  (Array.isArray(values) ? values : []).forEach((v) => {
    const key = normalizeKey(v);
    if (key) set.add(key);
  });
  return set;
};
