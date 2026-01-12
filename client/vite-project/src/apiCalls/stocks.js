import { axiosInstance } from "./index";

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

const gasGet = async (params) => {
  try {
    const res = await axiosInstance.get("/stocks/gas", {
      params,
      validateStatus: () => true,
    });
    if (isPlainObject(res?.data)) return res.data;
  } catch {
    return {};
  }
  return {};
};

const gasPost = async (payload) => {
  try {
    const res = await axiosInstance.post("/stocks/gas", payload || {}, {
      validateStatus: () => true,
    });
    if (isPlainObject(res?.data)) return res.data;
  } catch {
    return {};
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

export const listCurrentStocks = async ({ branch, limit = 500, page = 1 } = {}) => {
  const data = await gasGet({ action: "current", branch, limit, page });
  return {
    success: !!data.ok,
    data: data.data || [],
    total: data.total || 0,
    count: data.count || (data.data ? data.data.length : 0),
  };
};

export const listCurrentStocksPublic = async ({ branch, limit = 500, page = 1 } = {}) => {
  const data = await gasGet({ action: "current", branch, limit, page });
  return {
    success: !!data.ok,
    data: data.data || [],
    total: data.total || 0,
    count: data.count || (data.data ? data.data.length : 0),
  };
};

// Pending transfers must hit the backend (GAS does not track transfer admits/rejects)
export const listPendingTransfers = async ({ branch, limit = 500 } = {}) => {
  const params = { action: "pending", limit };
  if (branch) params.branch = branch;
  const data = await gasGet(params);
  return { success: !!data.ok, data: data.data || [], message: data.message };
};

export const createStock = async ({ data: row, createdBy }) => {
  const payload = { action: "create", data: row, createdBy };
  const data = await gasPost(payload);
  return { success: !!data.ok, data: data.data, message: data.message };
};

export const updateStock = async (movementId, patch) => {
  const payload = { action: "update", movementId, ...patch, data: patch };
  const data = await gasPost(payload);
  return { success: !!data.ok, data: data.data, message: data.message };
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
