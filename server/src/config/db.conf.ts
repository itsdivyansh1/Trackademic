// Configure Database here
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { UPSTASH_REDIS_URL } from "./index.conf";

export const prisma = new PrismaClient();

// Redis client with Upstash URL
export const redisClient = createClient({
  url: UPSTASH_REDIS_URL!, // put your Upstash URL in .env
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000), // Exponential backoff
  },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("ready", () => console.log("Redis ready"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();
