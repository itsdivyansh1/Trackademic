import { api } from "./api";

// Must match backend Prisma model (researchPublication)
export interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string | string[]; // Server stores as JSON array; handle strings for backward-compat
  journalConference: string;
  publicationYear: number;
  doi: string;
  publishedAt: string; // ISO string from backend
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isApproved?: boolean;
  user?: { id: string; name: string; email?: string; isApproved?: boolean; profileImage?: string | null };
}

export const getUserPublications = async (): Promise<Publication[]> => {
  const res = await api.get("/publication/my");
  return res.data.publications as Publication[];
};

export const createPublication = async (
  formData: FormData,
): Promise<Publication> => {
  const res = await api.post("/publication", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.publication as Publication;
};

export const updatePublication = async (
  id: string,
  formData: FormData,
): Promise<{ message: string }> => {
  const res = await api.put(`/publication/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log(res);
  return res.data;
};

export const deletePublication = async (
  id: string,
): Promise<{ message: string }> => {
  const res = await api.delete(`/publication/${id}`);
  return res.data; // { message: "Deleted successfully" }
};

// Get all public publications for explore page
export const getPublicPublications = async (): Promise<Publication[]> => {
  try {
    const res = await api.get("/publication/public");
    return res.data.publications as Publication[];
  } catch (error) {
    // Fallback to user publications if public endpoint doesn't exist
    return getUserPublications();
  }
};
