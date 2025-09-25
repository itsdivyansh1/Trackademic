import z from "zod";

export const ResearchPublicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  abstract: z.string().min(1, "Abstract is required"),
  authors: z.any().optional(), // JSON array of authors
  publicationYear: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear()),

  journalConference: z.string().min(1, "Journal/Conference is required"),
  doi: z.string().url("Invalid DOI format"),
  fileUrl: z.string().optional(), // Will come from S3 upload
  publishedAt: z.string().transform((val) => new Date(val)),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
});

export type ResearchPublicationInput = z.infer<
  typeof ResearchPublicationSchema
>;
