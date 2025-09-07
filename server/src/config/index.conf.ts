import { config } from "dotenv";

config();

export const { PORT, DATABASE_URL, UPSTASH_REDIS_URL, SESSION_SECRET } =
  process.env;
