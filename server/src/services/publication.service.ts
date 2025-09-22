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
  const data = Object.fromEntries(
    Object.entries(input).filter(([_, v]) => v !== undefined)
  );

  if (input.publishedAt) {
    data.publishedAt = new Date(input.publishedAt);
  }

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
    where: { userId, isApproved: true }, // only approved visible
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
