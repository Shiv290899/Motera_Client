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

export const listUsers = async (params = {}) => {
  const token = localStorage.getItem("token");
  const { data, status } = await axiosInstance.get("/users", {
    params: token ? { ...params, token } : params,
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};

export const listUsersPublic = async (params = {}) => {
  const owner = getOwnerId();
  const { data, status } = await axiosInstance.get("/users/public", {
    params: owner ? { ...params, owner } : params,
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};



export const updateUser = async (id, payload) => {
  const token = localStorage.getItem("token");
  const { data, status } = await axiosInstance.put(`/users/${id}`, payload, {
    params: token ? { token } : undefined,
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};

export const createUser = async (payload) => {
  const token = localStorage.getItem("token");
  const { data, status } = await axiosInstance.post("/users", payload, {
    params: token ? { token } : undefined,
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");
  const { data, status } = await axiosInstance.delete(`/users/${id}`, {
    params: token ? { token } : undefined,
    validateStatus: () => true,
  });
  return { ...data, _status: status };
};
