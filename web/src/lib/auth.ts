import { api } from "./api";

export const registerUser = async (data: FormData) => {
  const res = await api.post("/auth/register", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (data: FormData) => {
  const res = await api.put("/auth/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getS3Config = async () => {
  const res = await api.get("/auth/s3-config");
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};
