import { axiosInstance } from ".";

const getOwnerId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.ownerId || user?.owner?.id || null;
  } catch {
    return null;
  }
};

export const listBranches = async (params = {}) => {
  const { data, status } = await axiosInstance.get("/branches", {
    params,
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};

export const listBranchesPublic = async (params = {}) => {
  const owner = getOwnerId();
  const { data, status } = await axiosInstance.get("/branches/public", {
    params: owner ? { ...params, owner } : params,
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};

export const getBranch = async (id) => {
  const { data, status } = await axiosInstance.get(`/branches/${id}`, {
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};

export const createBranch = async (payload) => {
  const { data, status } = await axiosInstance.post("/branches", payload, {
    validateStatus: () => true,
  });
  return { ...data, _status: status }; // { success, message, data, _status }
};

export const updateBranch = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/branches/${id}`, payload, {
    validateStatus: () => true,
  });
  return { ...data, _status: status }; // { success, message, data, _status }
};

export const deleteBranch = async (id) => {
  const { data, status } = await axiosInstance.delete(`/branches/${id}`, {
    validateStatus: () => true,
  });
  return { ...data, _status: status }; // { success, message, _status }
};
