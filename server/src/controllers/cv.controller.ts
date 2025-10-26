import { Request, Response } from "express";
import { User as PrismaUser } from "@prisma/client";
import { prisma } from "../config/db.conf";
import {
  createOrUpdateCvData,
  getCvData,
  deleteCvData,
  generateCvPdf,
} from "../services/cv.service";
import { CvDataSchema, UpdateCvDataSchema, CvExportOptionsSchema } from "../types/cv.types";

// Create or update CV data
export const createOrUpdateCv = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = (req.user as PrismaUser).id;
    const validatedData = CvDataSchema.parse(req.body);

    const cvData = await createOrUpdateCvData(userId, validatedData);

    res.json({ message: "CV data saved successfully", cvData });
  } catch (err: any) {
    // Handle Zod validation errors
    if (err.name === 'ZodError' && err.errors && Array.isArray(err.errors)) {
      const formattedErrors = err.errors.map((error: any) => ({
        field: error.path ? error.path.join('.') : 'unknown',
        message: error.message || 'Validation error',
        code: error.code || 'invalid_type'
      }));
      return res.status(400).json({ 
        error: "Validation failed", 
        details: formattedErrors 
      });
    }
    res.status(400).json({ error: err.message || 'An error occurred while saving CV data' });
  }
};

// Get CV data
export const getCv = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = (req.user as PrismaUser).id;
    const cvData = await getCvData(userId);

    if (!cvData) {
      return res.status(404).json({ error: "CV data not found" });
    }

    res.json({ cvData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Update CV data (partial update)
export const updateCv = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = (req.user as PrismaUser).id;
    const validatedData = UpdateCvDataSchema.parse(req.body);

    // Ensure fullName is provided for updates
    let cvDataToSave: any = { ...validatedData };
    if (!cvDataToSave.fullName) {
      const existingCv = await getCvData(userId);
      if (existingCv) {
        cvDataToSave.fullName = existingCv.fullName;
      } else {
        return res.status(400).json({ error: "Full name is required for CV creation" });
      }
    }

    const cvData = await createOrUpdateCvData(userId, cvDataToSave);

    res.json({ message: "CV data updated successfully", cvData });
  } catch (err: any) {
    // Handle Zod validation errors
    if (err.name === 'ZodError' && err.errors && Array.isArray(err.errors)) {
      const formattedErrors = err.errors.map((error: any) => ({
        field: error.path ? error.path.join('.') : 'unknown',
        message: error.message || 'Validation error',
        code: error.code || 'invalid_type'
      }));
      return res.status(400).json({ 
        error: "Validation failed", 
        details: formattedErrors 
      });
    }
    res.status(400).json({ error: err.message || 'An error occurred while updating CV data' });
  }
};

// Delete CV data
export const deleteCv = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = (req.user as PrismaUser).id;
    await deleteCvData(userId);

    res.json({ message: "CV data deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Generate and download CV PDF
export const generateCv = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = (req.user as PrismaUser).id;
    const options = CvExportOptionsSchema.parse(req.body);

    const result = await generateCvPdf(userId, options);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.setHeader("Content-Length", result.pdfBuffer!.length);

    res.send(result.pdfBuffer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Preview CV (returns CV data with user's publications and achievements)
export const previewCv = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = (req.user as PrismaUser).id;

    // Get user with CV data, publications, and achievements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cvData: true,
        publications: {
          where: { visibility: "PUBLIC", isApproved: true },
          orderBy: { publicationYear: "desc" },
          take: 10,
        },
        achievements: {
          where: { visibility: "PUBLIC", isApproved: true },
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      cvData: user.cvData,
      publications: user.publications,
      achievements: user.achievements,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
