import { api } from "./api";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
  isApproved?: Boolean;
  user?: {
    id: string;
    name: string;
    email?: string;
    isApproved?: boolean;
    profileImage?: string | null;
  };
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

// Get all public achievements for explore page
export const getPublicAchievements = async (): Promise<Achievement[]> => {
  try {
    const res = await api.get("/achievement/public");
    return res.data.achievements;
  } catch (error) {
    // Fallback to user achievements if public endpoint doesn't exist
    return getUserAchievements();
  }
};

// Export the interface so it can be used elsewhere
export type { Achievement };
