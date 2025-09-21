import { config } from "dotenv";

config();

export const {
  PORT,
  DATABASE_URL,
  UPSTASH_REDIS_URL,
  SESSION_SECRET,
  S3_BUCKET_NAME,
} = process.env;
