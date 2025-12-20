// Return unique strings ignoring case, preserving the first-seen casing.
// Optionally sort case-insensitively when sortOutput is true.
export function uniqNoCase(values, { sortOutput = false } = {}) {
  const map = new Map();
  (values || []).forEach((v) => {
    const val = String(v ?? "").trim();
    if (!val) return;
    const key = val.toLowerCase();
    if (!map.has(key)) map.set(key, val);
  });
  const out = Array.from(map.values());
  return sortOutput ? out.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())) : out;
}

export function uniqNoCaseSorted(values) {
  return uniqNoCase(values, { sortOutput: true });
}
