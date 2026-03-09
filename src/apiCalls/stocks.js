import { axiosInstance } from "./index";
import { resolveUnifiedGasUrl } from '../utils/ownerConfig';

// Stocks are owner-scoped. URL must come from owner profile webhook configuration.
const getActiveGasUrl = () => resolveUnifiedGasUrl('stocks');

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);
const normalizeStockPatch = (patch = {}) => {
  const get = (a, b) => (patch[a] !== undefined ? patch[a] : patch[b]);
  const actionRaw = get("action", "Action");
  const chassisRaw = get("chassisNo", "Chassis_No");
  const normalized = {
    movementId: get("movementId", "MovementId"),
    chassisNo: chassisRaw ? String(chassisRaw).toUpperCase() : undefined,
    company: get("company", "Company"),
    model: get("model", "Model"),
    variant: get("variant", "Variant"),
    color: get("color", "Color"),
    action: actionRaw ? String(actionRaw).toLowerCase() : undefined,
    sourceBranch: get("sourceBranch", "Source_Branch"),
    targetBranch: get("targetBranch", "Target_Branch"),
    returnTo: get("returnTo", "Return_To"),
    customerName: get("customerName", "Customer_Name"),
    transferStatus: get("transferStatus", "Transfer_Status"),
    notes: get("notes", "Notes"),
    createdByName: get("createdByName", "CreatedByName"),
    createdById: get("createdById", "CreatedById"),
    resolvedByName: get("resolvedByName", "ResolvedByName"),
    resolvedById: get("resolvedById", "ResolvedById"),
    resolvedAt: get("resolvedAt", "ResolvedAt"),
    deleted: get("deleted", "Deleted"),
    timestamp: get("timestamp", "Timestamp"),
  };
  return normalized;
};

const gasGet = async (params) => {
  const activeGasUrl = getActiveGasUrl();
  if (!activeGasUrl) return { ok: false, message: "Owner web app URL is not configured." };
  // 1) Backend proxy (preferred)
  try {
    const res = await axiosInstance.get("/stocks/gas", {
      params: { ...params, ...(activeGasUrl ? { gasUrl: activeGasUrl } : {}) },
      validateStatus: () => true,
    });
    if (isPlainObject(res?.data)) return res.data;
  } catch {
    // ignore and fall back
  }
  return {};
};

const gasPost = async (payload) => {
  const activeGasUrl = getActiveGasUrl();
  if (!activeGasUrl) return { ok: false, message: "Owner web app URL is not configured." };
  // 1) Backend proxy (preferred)
  try {
    const res = await axiosInstance.post("/stocks/gas", { ...(payload || {}), ...(activeGasUrl ? { gasUrl: activeGasUrl } : {}) }, {
      validateStatus: () => true,
    });
    if (isPlainObject(res?.data)) return res.data;
  } catch {
    // ignore and fall back
  }
  return {};
};

// Fetch stock movements. Default to a high limit so admin can see all recent records.
export const listStocks = async ({ branch, mode, limit = 1000, page = 1 } = {}) => {
  const data = await gasGet({ action: "list", branch, mode, limit, page });
  return {
    success: !!data.ok,
    data: data.data || [],
    total: data.total || 0,
    count: data.count || (data.data ? data.data.length : 0),
  };
};

export const listStocksPublic = async ({ branch, mode, limit = 1000, page = 1 } = {}) => {
  const data = await gasGet({ action: "list", branch, mode, limit, page });
  return {
    success: !!data.ok,
    data: data.data || [],
    total: data.total || 0,
    count: data.count || (data.data ? data.data.length : 0),
  };
};

export const listCurrentStocks = async ({ branch, limit = 5000, page = 1 } = {}) => {
  const data = await gasGet({ action: "current", branch, limit, page });
  return {
    success: !!data.ok,
    data: data.data || [],
    total: data.total || 0,
    count: data.count || (data.data ? data.data.length : 0),
  };
};

export const listCurrentStocksPublic = async ({ branch, limit = 5000, page = 1 } = {}) => {
  const data = await gasGet({ action: "current", branch, limit, page });
  return {
    success: !!data.ok,
    data: data.data || [],
    total: data.total || 0,
    count: data.count || (data.data ? data.data.length : 0),
  };
};

// Pending transfers must hit the backend (GAS does not track transfer admits/rejects)
export const listPendingTransfers = async ({ branch, limit = 5000 } = {}) => {
  const params = { action: "pending", limit };
  if (branch) params.branch = branch;
  const data = await gasGet(params);
  return { success: !!data.ok, data: data.data || [], message: data.message };
};

export const createStock = async ({ data: row, createdBy }) => {
  const payload = { action: "create", data: row, createdBy };
  const data = await gasPost(payload);
  return { success: !!data.ok, data: data.data, message: data.message, code: data.code };
};

export const updateStock = async (movementId, patch) => {
  const normalized = normalizeStockPatch(patch || {});
  const payload = { action: "update", movementId, data: normalized };
  const data = await gasPost(payload);
  return { success: !!data.ok, data: data.data, message: data.message, code: data.code };
};

export const deleteStock = async (movementId) => {
  const data = await gasPost({ action: "delete", movementId });
  return { success: !!data.ok, message: data.message };
};

export const admitTransfer = async (movementId, notes) => {
  const data = await gasPost({ action: "admit", movementId, notes });
  return { success: !!data.ok, data: data.data, message: data.message };
};

export const rejectTransfer = async (movementId, reason) => {
  const data = await gasPost({ action: "reject", movementId, reason, notes: reason });
  return { success: !!data.ok, data: data.data, message: data.message };
};
