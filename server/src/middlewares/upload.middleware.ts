import multer from "multer";
import multerS3 from "multer-s3";
import { S3_BUCKET_NAME } from "../config/index.conf";
import s3 from "../config/s3.config";

export const uploadFile = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: (_req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req, file, cb) => {
      const timestamp = Date.now();
      cb(null, `achievements/${timestamp}-${file.originalname}`);
    },
  }),
});
