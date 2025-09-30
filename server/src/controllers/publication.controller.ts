import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { User as PrismaUser } from "@prisma/client";
import { Request, Response } from "express";

import {
  approvePublication,
  createPublication,
  deletePublication,
  getAllPublicationsAdmin,
  getAllUserPublications,
  getPublicPublications,
  getUserPublications,
  updatePublication,
} from "../services/publication.service";

import { S3_BUCKET_NAME } from "../config/index.conf";
import s3 from "../config/s3.config";
import { ResearchPublicationSchema } from "../types/publication.types";
import { S3File } from "../types/s3.types";

// Helper: generate signed URLs for publications
async function addSignedUrls(publications: any[]) {
  return Promise.all(
    publications.map(async (pub) => {
      if (!pub.fileUrl) return pub;

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: pub.fileUrl,
      });

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
      return { ...pub, fileUrl: signedUrl };
    })
  );
}

// CREATE
export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const validated = ResearchPublicationSchema.parse(req.body);
    // Normalize authors: accept comma-separated string or JSON array
    let authors = validated.authors as any;
    if (typeof authors === "string") {
      try {
        const maybeJson = JSON.parse(authors);
        if (Array.isArray(maybeJson)) {
          authors = maybeJson;
        } else {
          authors = String(authors)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } catch {
        authors = String(authors)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const file = req.file as S3File | undefined;
    if (!file?.key)
      return res.status(400).json({ error: "File upload required" });

    const publication = await createPublication(
      { ...validated, authors, fileUrl: file.key },
      (req.user as PrismaUser).id
    );

    const publicationWithUrl = (await addSignedUrls([publication]))[0];
    res.status(201).json({ publication: publicationWithUrl });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LIST user’s approved publications
export const listUserPublications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const publications = await getUserPublications((req.user as PrismaUser).id);
    const publicationsWithUrls = await addSignedUrls(publications);

    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LIST all user’s publications
export const listAllUserPublications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const publications = await getAllUserPublications(
      (req.user as PrismaUser).id
    );
    const publicationsWithUrls = await addSignedUrls(publications);

    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LIST all public (approved) publications
export const listPublicPublications = async (_req: Request, res: Response) => {
  try {
    const publications = await getPublicPublications();
    const publicationsWithUrls = await addSignedUrls(publications);

    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE
export const update = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Publication ID required" });

    // Handle multipart form data
    const updateData: any = {};

    // Parse form fields - handle both multipart and regular form data
    const body = req.body || {};

    if (body.title) updateData.title = body.title;
    if (body.abstract) updateData.abstract = body.abstract;
    if (body.authors) {
      let authors: any = body.authors;
      if (typeof authors === "string") {
        try {
          const maybeJson = JSON.parse(authors);
          authors = Array.isArray(maybeJson)
            ? maybeJson
            : String(authors)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        } catch {
          authors = String(authors)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      updateData.authors = authors;
    }
    if (body.journalConference)
      updateData.journalConference = body.journalConference;
    if (body.category) updateData.category = body.category;
    if (body.publicationYear)
      updateData.publicationYear = parseInt(body.publicationYear);
    if (body.doi) updateData.doi = body.doi;
    if (body.publishedAt) updateData.publishedAt = body.publishedAt;
    if (body.visibility) updateData.visibility = body.visibility;

    // Handle file upload ONLY if a new file is provided
    const file = req.file as S3File | undefined;
    if (file?.key) {
      updateData.fileUrl = file.key;
    }
    // If no file is provided, don't update the fileUrl field
    // This preserves the existing file

    console.log("Update data:", updateData); // Debug log

    const result = await updatePublication(
      id,
      updateData,
      (req.user as PrismaUser).id
    );

    if (result.count === 0) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Updated successfully" });
  } catch (err: any) {
    console.error("Update publication error:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE
export const remove = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Publication ID required" });

    const result = await deletePublication(id, (req.user as PrismaUser).id);
    if (result.count === 0) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: approve publication
export const approve = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const user = req.user as PrismaUser;
    if (user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only admins can approve publications" });
    }

    const id = req.params.id;
    if (!id)
      return res.status(400).json({ error: "Publication ID is required" });

    const publication = await approvePublication(id, user.id);
    const publicationWithUrl = (await addSignedUrls([publication]))[0];

    res.json({
      message: "Publication approved",
      publication: publicationWithUrl,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: list all
export const listAllAdmin = async (_req: Request, res: Response) => {
  try {
    const publications = await getAllPublicationsAdmin();
    const publicationsWithUrls = await addSignedUrls(publications);

    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
