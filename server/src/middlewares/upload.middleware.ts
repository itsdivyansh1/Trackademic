// src/middleware/upload.middleware.ts
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { S3_BUCKET_NAME } from "../config/index.conf";
import s3 from "../config/s3.config";

/**
 * Existing S3 uploader factory (keeps streaming directly to S3).
 * Keep this for other flows where you don't need buffer.
 */
export const createUploader = (folder: string) =>
  multer({
    storage: multerS3({
      s3,
      bucket: S3_BUCKET_NAME!,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (_req, file, cb) => cb(null, { fieldName: file.fieldname }),
      key: (_req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `${folder}/${timestamp}-${file.originalname}`);
      },
    }),
  });

/**
 * Memory storage - keeps file.buffer for verification
 * Use this for publication uploads so you can parse PDF, verify, then upload to S3.
 */
const memoryStorage = multer.memoryStorage();

export const memoryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only PDF, DOC and DOCX files are allowed"));
  },
});

// optional: keep s3-direct uploaders for other uses
export const uploadAchievement = createUploader("achievements");
export const uploadPublication = createUploader("publications");
export const uploadProfile = createUploader("profiles");
