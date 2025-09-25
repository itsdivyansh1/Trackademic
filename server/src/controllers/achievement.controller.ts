import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { User as PrismaUser } from "@prisma/client";
import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../config/db.conf"; // make sure you import prisma client
import { S3_BUCKET_NAME } from "../config/index.conf";
import s3 from "../config/s3.config";
import {
  approveAchievement,
  createAchievement,
  deleteAchievement,
  getAllUserAchievements,
  getPublicAchievements,
  updateAchievement,
} from "../services/achievement.service";
import { AchievementSchema } from "../types/achievement.types";
import { S3File } from "../types/s3.types";

// Add signed URL helper
async function addSignedUrls(achievements: any[]) {
  return Promise.all(
    achievements.map(async (ach) => {
      if (!ach.fileUrl) return ach;

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: ach.fileUrl,
      });

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
      return { ...ach, fileUrl: signedUrl };
    })
  );
}

// CREATE
export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const validated = AchievementSchema.parse(req.body);

    const file = req.file as S3File | undefined;
    if (!file?.key)
      return res.status(400).json({ error: "File upload required" });

    const achievement = await createAchievement(
      { ...validated, fileUrl: file.key },
      (req.user as PrismaUser).id
    );
    res.status(201).json({ achievement });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// List only public achievements
export const listPublicAchievements = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const achievements = await getPublicAchievements(
      (req.user as PrismaUser).id
    );
    const achievementsWithUrl = await addSignedUrls(achievements);

    res.json({ achievements: achievementsWithUrl });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// List all achievements of the logged-in user (public + private)
export const listAllAchievements = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const achievements = await getAllUserAchievements(
      (req.user as PrismaUser).id
    );
    const achievementsWithUrl = await addSignedUrls(achievements);

    res.json({ achievements: achievementsWithUrl });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE
export const update = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const input = req.body as Partial<
      z.infer<typeof AchievementSchema> & { fileUrl?: string }
    >;

    const id = req.params.id;
    if (!id)
      return res.status(400).json({ error: "Achievement ID is required" });

    // find current achievement (to know old file key)
    const existing = await prisma.achievement.findFirst({
      where: { id, userId: (req.user as PrismaUser).id },
    });
    if (!existing)
      return res.status(404).json({ error: "Achievement not found" });

    // If a new file uploaded → replace and delete old file from S3
    const file = req.file as S3File | undefined;
    if (file?.key) {
      input.fileUrl = file.key;

      if (existing.fileUrl) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: existing.fileUrl,
          })
        );
      }
    }

    const result = await updateAchievement(
      id,
      input,
      (req.user as PrismaUser).id
    );

    if (result.count === 0)
      return res.status(404).json({ error: "Achievement not found" });

    res.json({ message: "Updated successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
export const remove = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    if (!id)
      return res.status(400).json({ error: "Achievement ID is required" });

    // fetch the achievement to get file key
    const existing = await prisma.achievement.findFirst({
      where: { id, userId: (req.user as PrismaUser).id },
    });
    if (!existing)
      return res.status(404).json({ error: "Achievement not found" });

    // delete record from DB
    const result = await deleteAchievement(id, (req.user as PrismaUser).id);

    if (result.count === 0)
      return res.status(404).json({ error: "Achievement not found" });

    // delete file from S3 if exists
    if (existing.fileUrl) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: existing.fileUrl,
        })
      );
    }

    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ACHIEVEMENT APPROVAL BY ADMIN
export const approve = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const user = req.user as PrismaUser;
    if (user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only admins can approve achievements" });
    }

    const id = req.params.id;
    if (!id)
      return res.status(400).json({ error: "Achievement ID is required" });

    const achievement = await approveAchievement(id, user.id);

    res.json({ message: "Achievement approved successfully", achievement });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
