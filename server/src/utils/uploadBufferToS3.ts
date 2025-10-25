// src/utils/uploadBufferToS3.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { S3_BUCKET_NAME } from "../config/index.conf";
import s3 from "../config/s3.config";

export async function uploadBufferToS3(
  buffer: Buffer,
  originalname: string
): Promise<string> {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(originalname) || "";
  const key = `publications/${uniqueSuffix}${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: getContentType(ext),
  });

  await s3.send(command);
  return key;
}

function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return contentTypes[ext.toLowerCase()] || "application/octet-stream";
}
