import { Router } from "express";
import {
  createOrUpdateCv,
  getCv,
  updateCv,
  deleteCv,
  generateCv,
  previewCv,
} from "../../controllers/cv.controller";
import { isAuthenticated } from "../../middlewares/auth.middleware";

const router = Router();

// All CV routes require authentication
router.use(isAuthenticated);

// CV data management
router.post("/", createOrUpdateCv);           // Create or update CV data
router.get("/", getCv);                      // Get CV data
router.patch("/", updateCv);                 // Partial update CV data
router.delete("/", deleteCv);                // Delete CV data

// CV generation and preview
router.post("/generate", generateCv);        // Generate and download CV PDF
router.get("/preview", previewCv);           // Preview CV data with publications/achievements

export default router;
