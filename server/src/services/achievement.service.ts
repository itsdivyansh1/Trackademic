import { Prisma } from "@prisma/client";
import z from "zod";
import { prisma } from "../config/db.conf";
import { AchievementSchema } from "../types/achievement.types";

export const createAchievement = async (
  input: z.infer<typeof AchievementSchema> & { fileUrl: string },
  userId: string
) => {
  const { title, description, category, date, visibility, fileUrl } = input;

  const newAchievement = await prisma.achievement.create({
    data: {
      title,
      description,
      category: category ?? null,
      date,
      visibility,
      fileUrl,
      userId,
    },
  });

  return newAchievement;
};

export const updateAchievement = async (
  id: string,
  input: Partial<z.infer<typeof AchievementSchema> & { fileUrl?: string }>,
  userId: string
) => {
  // Build a safe data object
  const data: Prisma.AchievementUpdateManyMutationInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.category !== undefined) data.category = input.category ?? null;
  if (input.date !== undefined) data.date = new Date(input.date);
  if (input.visibility !== undefined) data.visibility = input.visibility;
  if (input.fileUrl !== undefined) data.fileUrl = input.fileUrl;

  return prisma.achievement.updateMany({
    where: { id, userId },
    data,
  });
};

export const deleteAchievement = async (id: string, userId: string) => {
  return prisma.achievement.deleteMany({
    where: { id, userId },
  });
};

export const getUserAchievements = async (userId: string) => {
  return prisma.achievement.findMany({
    where: { userId },
  });
};

export const getPublicAchievements = async (userId: string) => {
  return prisma.achievement.findMany({
    where: {
      userId,
      visibility: "PUBLIC", // only public achievements
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllPublicAchievements = async () => {
  return prisma.achievement.findMany({
    where: { visibility: "PUBLIC", isApproved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, isApproved: true },
      },
    },
  });
};

// Get all achievements of a user (public + private)
export const getAllUserAchievements = async (userId: string) => {
  return prisma.achievement.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

// Admin can approve achievements that is uploaded
export const approveAchievement = async (id: string, adminId: string) => {
  return prisma.achievement.update({
    where: { id },
    data: {
      isApproved: true,
      approvedById: adminId,
    },
    include: {
      user: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });
};
