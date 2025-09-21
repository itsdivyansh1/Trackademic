import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { UPSTASH_REDIS_URL } from "./index.conf";

// Setting up prisma ORM
export const prisma = new PrismaClient();

// Setting up Redis
export const redisClient = createClient({
  url: UPSTASH_REDIS_URL!, // put your Upstash URL in .env
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000), // Exponential backoff
  },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("ready", () => console.log("Redis ready"));
redisClient.connect().catch((err) => console.log(err.message));
