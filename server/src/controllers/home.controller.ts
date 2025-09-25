// controllers/home.controller.ts
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request, Response } from "express";
import { S3_BUCKET_NAME } from "../config/index.conf";
import s3 from "../config/s3.config";
import { getAllPublicAchievements } from "../services/achievement.service";
import { getAllPublicPublications } from "../services/publication.service";

// Reusable helper
async function addSignedUrls(items: any[]) {
  return Promise.all(
    items.map(async (item) => {
      if (!item.fileUrl) return item;

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: item.fileUrl,
      });

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
      return { ...item, fileUrl: signedUrl };
    })
  );
}

export async function getHomeFeed(req: Request, res: Response) {
  try {
    const [achievements, publications] = await Promise.all([
      getAllPublicAchievements(),
      getAllPublicPublications(),
    ]);

    // Add signed URLs
    const achievementsWithUrl = await addSignedUrls(achievements);
    const publicationsWithUrl = await addSignedUrls(publications);

    // Normalize achievements
    const normalizedAchievements = achievementsWithUrl.map((a) => ({
      ...a,
      feedType: "achievement" as const,
      feedDate: a.updatedAt, // achievements have `date`
    }));

    // Normalize publications
    const normalizedPublications = publicationsWithUrl.map((p) => ({
      ...p,
      feedType: "publication" as const,
      feedDate: p.updatedAt, // publications use `publishedAt`
    }));

    // Merge & sort
    const combinedFeed = [
      ...normalizedAchievements,
      ...normalizedPublications,
    ].sort(
      (a, b) => new Date(b.feedDate).getTime() - new Date(a.feedDate).getTime()
    );

    res.json({ feed: combinedFeed });
  } catch (error) {
    console.error("Error fetching home feed:", error);
    res.status(500).json({ message: "Error fetching home feed" });
  }
}
