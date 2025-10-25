import { prisma } from "../config/db.conf";
import { ResearchPublicationInput } from "../types/publication.types";

export const createPublication = async (
  input: ResearchPublicationInput & { fileUrl: string },
  userId: string,
  isApproved: boolean = false // New parameter for verification result
) => {
  return prisma.researchPublication.create({
    data: {
      ...input,
      userId,
      isApproved, // Set based on verification
    },
  });
};

export const updatePublication = async (
  id: string,
  input: Partial<
    ResearchPublicationInput & { fileUrl?: string; isApproved?: boolean }
  >,
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

  console.log("Service update data:", data);

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

function normalizeAuthors<T extends { authors?: any }>(
  pub: T
): T & { authors: string[] } {
  let a = pub.authors;
  let arr: string[] = [];
  if (Array.isArray(a)) {
    arr = a.map((s) => String(s));
  } else if (typeof a === "string") {
    try {
      const parsed = JSON.parse(a);
      if (Array.isArray(parsed)) {
        arr = parsed.map((s: any) => String(s));
      } else if (parsed && typeof parsed === "object") {
        arr = Object.values(parsed as any).map((s: any) => String(s));
      } else {
        arr = String(a)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      arr = String(a)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  } else if (a && typeof a === "object") {
    arr = Object.values(a as any).map((s: any) => String(s));
  }
  return { ...(pub as any), authors: arr };
}

export const getUserPublications = async (userId: string) => {
  const pubs = await prisma.researchPublication.findMany({
    where: { userId, isApproved: true },
    orderBy: { createdAt: "desc" },
  });
  return pubs.map((p) => normalizeAuthors(p));
};

export const getAllUserPublications = async (userId: string) => {
  const pubs = await prisma.researchPublication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return pubs.map((p) => normalizeAuthors(p));
};

export const getPublicPublications = async () => {
  const pubs = await prisma.researchPublication.findMany({
    where: { visibility: "PUBLIC", isApproved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isApproved: true,
          profileImage: true,
        },
      },
    },
  });
  return pubs.map((p) => normalizeAuthors(p));
};

export const getAllPublicPublications = async () => {
  const pubs = await prisma.researchPublication.findMany({
    where: { visibility: "PUBLIC", isApproved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, isApproved: true },
      },
    },
  });
  return pubs.map((p) => normalizeAuthors(p));
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
  const pubs = await prisma.researchPublication.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, approvedBy: true },
  });
  return pubs.map((p) => normalizeAuthors(p));
};
