// Handling all the api calls of achievement routes
import { api } from "./api";

export const getHomeFeed = async () => {
  const res = await api.get("/feed");
  return res.data;
};
