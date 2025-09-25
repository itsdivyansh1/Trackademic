import { api } from "./api";

// Must match backend Prisma model (researchPublication)
export interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  journalConference: string;
  publicationYear: number;
  doi: string;
  publishedAt: string; // ISO string from backend
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isApproved?: boolean;
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
