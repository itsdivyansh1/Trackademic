import { api } from "./api";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
}

export const getUserAchievements = async (): Promise<Achievement[]> => {
  const res = await api.get("/achievement/my");
  return res.data.achievements;
};

export const createAchievement = async (formData: FormData) => {
  const res = await api.post("/achievement", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.achievement;
};

export const updateAchievement = async (id: string, formData: FormData) => {
  const res = await api.put(`/achievement/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteAchievement = async (id: string) => {
  const res = await api.delete(`/achievement/${id}`);
  return res.data;
};
