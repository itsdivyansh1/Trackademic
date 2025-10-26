import { z } from "zod";

// Education entry schema
export const EducationEntrySchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  description: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

// Experience entry schema
export const ExperienceEntrySchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  isCurrent: z.boolean().default(false),
});

// Skill entry schema
export const SkillEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("INTERMEDIATE"),
  category: z.string().optional(),
});

// Language entry schema
export const LanguageEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Language name is required"),
  proficiency: z.enum(["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "NATIVE"]).default("CONVERSATIONAL"),
});

// Certification entry schema
export const CertificationEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
});

// CV Template enum
export const CvTemplateSchema = z.enum(["MODERN", "CLASSIC", "MINIMAL", "CREATIVE"]);

// Main CV data schema
export const CvDataSchema = z.object({
  // Personal Information
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().optional(),
  summary: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  
  // Arrays
  education: z.array(EducationEntrySchema).optional(),
  experience: z.array(ExperienceEntrySchema).optional(),
  skills: z.array(SkillEntrySchema).optional(),
  languages: z.array(LanguageEntrySchema).optional(),
  certifications: z.array(CertificationEntrySchema).optional(),
  
  // CV Preferences
  template: CvTemplateSchema.default("MODERN"),
  includePhoto: z.boolean().default(true),
  includeAddress: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
});

// Update CV data schema (partial)
export const UpdateCvDataSchema = CvDataSchema.partial();

// CV export options schema
export const CvExportOptionsSchema = z.object({
  template: CvTemplateSchema.default("MODERN"),
  includePhoto: z.boolean().default(true),
  includeAddress: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
  includePublications: z.boolean().default(true),
  includeAchievements: z.boolean().default(true),
  maxPublications: z.number().min(1).max(50).default(10),
  maxAchievements: z.number().min(1).max(50).default(10),
});

// Type exports
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type SkillEntry = z.infer<typeof SkillEntrySchema>;
export type LanguageEntry = z.infer<typeof LanguageEntrySchema>;
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;
export type CvTemplate = z.infer<typeof CvTemplateSchema>;
export type CvData = z.infer<typeof CvDataSchema>;
export type UpdateCvData = z.infer<typeof UpdateCvDataSchema>;
export type CvExportOptions = z.infer<typeof CvExportOptionsSchema>;

// CV generation result
export interface CvGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  error?: string;
  fileName?: string;
}
