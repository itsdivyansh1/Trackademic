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
import { ResearchPublicationSchema } from "../types/publication.types";
import { S3File } from "../types/s3.types";

// CREATE
export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const validated = ResearchPublicationSchema.parse(req.body);
    const file = req.file as S3File | undefined;
    if (!file?.key)
      return res.status(400).json({ error: "File upload required" });

    const publication = await createPublication(
      { ...validated, fileUrl: file.key },
      (req.user as PrismaUser).id
    );

    res.status(201).json({ publication });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LIST user’s approved publications
export const listUserPublications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const publications = await getUserPublications((req.user as PrismaUser).id);
    res.json({ publications });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LIST all user’s publications (admin or owner)
export const listAllUserPublications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const publications = await getAllUserPublications(
      (req.user as PrismaUser).id
    );
    res.json({ publications });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LIST all public (approved) publications
export const listPublicPublications = async (_req: Request, res: Response) => {
  try {
    const publications = await getPublicPublications();
    res.json({ publications });
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

    const result = await updatePublication(
      id,
      req.body,
      (req.user as PrismaUser).id
    );

    if (result.count === 0) return res.status(404).json({ error: "Not found" });

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
        .json({ error: "Forbidden: Only admins can approve achievements" });
    }

    const id = req.params.id;
    if (!id)
      return res.status(400).json({ error: "Achievement ID is required" });

    const publication = await approvePublication(
      id,
      (req.user as PrismaUser).id
    );

    res.json({ message: "Publication approved", publication });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: list all
export const listAllAdmin = async (_req: Request, res: Response) => {
  try {
    const publications = await getAllPublicationsAdmin();
    res.json({ publications });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
