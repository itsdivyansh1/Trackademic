import { prisma } from "../config/db.conf";
import { ResearchPublicationInput } from "../types/publication.types";

export const createPublication = async (
  input: ResearchPublicationInput & { fileUrl: string },
  userId: string
) => {
  return prisma.researchPublication.create({
    data: {
      ...input,
      userId,
      isApproved: false, // requires admin approval
    },
  });
};

export const updatePublication = async (
  id: string,
  input: Partial<ResearchPublicationInput & { fileUrl?: string }>,
  userId: string
) => {
  // Filter out undefined values to prevent overwriting existing data with undefined
  const data: any = {};

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      data[key] = value;
    }
  });

  // Handle publishedAt safely
  if (data.publishedAt) {
    data.publishedAt =
      typeof data.publishedAt === "string"
        ? new Date(data.publishedAt)
        : data.publishedAt;
  }

  // Convert publicationYear to number if it's a string
  if (data.publicationYear && typeof data.publicationYear === "string") {
    data.publicationYear = parseInt(data.publicationYear);
  }

  console.log("Service update data:", data); // Debug log

  return prisma.researchPublication.updateMany({
    where: { id, userId },
    data,
  });
};

export const deletePublication = async (id: string, userId: string) => {
  return prisma.researchPublication.deleteMany({
    where: { id, userId },
  });
};

export const getUserPublications = async (userId: string) => {
  return prisma.researchPublication.findMany({
    where: { userId, isApproved: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllUserPublications = async (userId: string) => {
  return prisma.researchPublication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getPublicPublications = async () => {
  return prisma.researchPublication.findMany({
    where: { visibility: "PUBLIC", isApproved: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllPublicPublications = async () => {
  return prisma.researchPublication.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, isApproved: true },
      },
    },
  });
};

// ADMIN
export const approvePublication = async (id: string, adminId: string) => {
  return prisma.researchPublication.update({
    where: { id },
    data: {
      isApproved: true,
      approvedById: adminId,
    },
  });
};

export const getAllPublicationsAdmin = async () => {
  return prisma.researchPublication.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, approvedBy: true },
  });
};
