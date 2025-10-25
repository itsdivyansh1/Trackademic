// src/controllers/publication.controller.ts
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
import { verifyPaperFromBuffer } from "../services/papterVerification.service";
import { ResearchPublicationSchema } from "../types/publication.types";
import { uploadBufferToS3 } from "../utils/uploadBufferToS3";

/** Helper: add signed URLs for fileUrl keys */
async function addSignedUrls(publications: any[]) {
  return Promise.all(
    publications.map(async (pub) => {
      if (!pub.fileUrl) return pub;
      try {
        const command = new GetObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: pub.fileUrl,
        });
        const signedUrl = await getSignedUrl(s3, command, {
          expiresIn: 60 * 5,
        });
        return { ...pub, fileUrl: signedUrl };
      } catch (err) {
        // If signed URL fails, return pub as-is (no crash)
        return pub;
      }
    })
  );
}

/**
 * CREATE publication
 * Use memoryUpload.single('file') in your route so req.file.buffer exists.
 */
export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // validate body
    const validated = ResearchPublicationSchema.parse(req.body);

    // Normalize authors (same logic you had)
    let authors = validated.authors as any;
    if (typeof authors === "string") {
      try {
        const maybeJson = JSON.parse(authors);
        if (Array.isArray(maybeJson)) authors = maybeJson;
        else
          authors = String(authors)
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

    // Expect memory multer -> file.buffer available
    const file = req.file as Express.Multer.File | undefined;
    if (!file || !("buffer" in file) || !file.buffer) {
      return res.status(400).json({ error: "File upload required" });
    }

    // Verify from buffer
    let isApproved = false;
    let verificationMessage = "Pending manual verification";
    try {
      console.log("Starting paper verification...");
      const verificationResult = await verifyPaperFromBuffer(
        file.buffer as Buffer
      );

      if (verificationResult.valid) {
        isApproved = true;
        verificationMessage = `Auto-verified via ${verificationResult.type}`;
        console.log("Paper verified:", verificationResult);
      } else {
        verificationMessage =
          verificationResult.message || "Verification failed";
        console.log("Paper verification failed:", verificationResult);
      }
    } catch (err) {
      console.error("Verification error:", err);
      verificationMessage = "Verification error - requires manual review";
    }

    // Upload buffer to S3 (manual)
    const key = await uploadBufferToS3(
      file.buffer as Buffer,
      file.originalname
    );

    // Save publication in DB
    const publication = await createPublication(
      { ...validated, authors, fileUrl: key },
      (req.user as PrismaUser).id,
      isApproved
    );

    const publicationWithUrl = (await addSignedUrls([publication]))[0];

    res.status(201).json({
      publication: publicationWithUrl,
      verificationStatus: {
        isApproved,
        message: verificationMessage,
      },
    });
  } catch (err: any) {
    console.error("Create publication error:", err);
    res
      .status(400)
      .json({ error: err?.message || "Failed to create publication" });
  }
};

/**
 * UPDATE publication
 * If a new file is uploaded use memoryUpload.single('file') here too.
 */
export const update = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Publication ID required" });

    const updateData: any = {};
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

    // If a new file is uploaded via memoryUpload, verify & upload it
    const file = req.file as Express.Multer.File | undefined;
    if (file && "buffer" in file && file.buffer) {
      try {
        console.log("Verifying updated paper...");
        const verificationResult = await verifyPaperFromBuffer(
          file.buffer as Buffer
        );

        if (verificationResult.valid) {
          updateData.isApproved = true;
          console.log("Updated paper verified:", verificationResult);
        } else {
          updateData.isApproved = false;
          console.log("Updated paper verification failed:", verificationResult);
        }
      } catch (err) {
        console.error("Verification error on update:", err);
        updateData.isApproved = false;
      }

      // Upload buffer to S3 and set fileUrl
      const key = await uploadBufferToS3(
        file.buffer as Buffer,
        file.originalname
      );
      updateData.fileUrl = key;
    }

    const result = await updatePublication(
      id,
      updateData,
      (req.user as PrismaUser).id
    );

    if (result.count === 0) return res.status(404).json({ error: "Not found" });

    res.json({
      message: "Updated successfully",
      reVerified: !!file,
    });
  } catch (err: any) {
    console.error("Update publication error:", err);
    res
      .status(400)
      .json({ error: err?.message || "Failed to update publication" });
  }
};

/* Remaining endpoints unchanged (list, delete, admin). Use previous implementations or keep them here: */
export const listUserPublications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const publications = await getUserPublications((req.user as PrismaUser).id);
    const publicationsWithUrls = await addSignedUrls(publications);
    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
};

export const listAllUserPublications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const publications = await getAllUserPublications(
      (req.user as PrismaUser).id
    );
    const publicationsWithUrls = await addSignedUrls(publications);
    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
};

export const listPublicPublications = async (_req: Request, res: Response) => {
  try {
    const publications = await getPublicPublications();
    const publicationsWithUrls = await addSignedUrls(publications);
    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Publication ID required" });
    const result = await deletePublication(id, (req.user as PrismaUser).id);
    if (result.count === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
};

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
    res.status(400).json({ error: err?.message });
  }
};

export const listAllAdmin = async (_req: Request, res: Response) => {
  try {
    const publications = await getAllPublicationsAdmin();
    const publicationsWithUrls = await addSignedUrls(publications);
    res.json({ publications: publicationsWithUrls });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
};
