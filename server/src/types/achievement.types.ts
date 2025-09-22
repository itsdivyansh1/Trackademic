import z from "zod";

export const AchievementSchema = z.object({
  title: z.string(),
  description: z.string(), // required
  category: z.string().optional(), // still optional
  date: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
  }, z.date()),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
});
