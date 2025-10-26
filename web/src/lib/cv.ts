import { api } from "./api";

// CV Data types
export interface EducationEntry {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface ExperienceEntry {
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
  isCurrent?: boolean;
}

export interface SkillEntry {
  id?: string;
  name: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category?: string;
}

export interface LanguageEntry {
  id?: string;
  name: string;
  proficiency: "BASIC" | "CONVERSATIONAL" | "PROFESSIONAL" | "NATIVE";
}

export interface CertificationEntry {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CvData {
  fullName: string;
  title?: string;
  summary?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  skills?: SkillEntry[];
  languages?: LanguageEntry[];
  certifications?: CertificationEntry[];
  template?: "MODERN" | "CLASSIC" | "MINIMAL" | "CREATIVE";
  includePhoto?: boolean;
  includeAddress?: boolean;
  includeSummary?: boolean;
}

export interface CvExportOptions {
  template?: "MODERN" | "CLASSIC" | "MINIMAL" | "CREATIVE";
  includePhoto?: boolean;
  includeAddress?: boolean;
  includeSummary?: boolean;
  includePublications?: boolean;
  includeAchievements?: boolean;
  maxPublications?: number;
  maxAchievements?: number;
}

export interface CvPreview {
  cvData: CvData | null;
  publications: any[];
  achievements: any[];
}

// API functions
export const createOrUpdateCvData = async (data: CvData) => {
  const res = await api.post("/cv", data);
  return res.data;
};

export const getCvData = async () => {
  const res = await api.get("/cv");
  return res.data;
};

export const updateCvData = async (data: Partial<CvData>) => {
  const res = await api.patch("/cv", data);
  return res.data;
};

export const deleteCvData = async () => {
  const res = await api.delete("/cv");
  return res.data;
};

export const generateCvPdf = async (options: CvExportOptions) => {
  const res = await api.post("/cv/generate", options, {
    responseType: "blob",
  });
  
  // Create download link
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  // Extract filename from response headers
  const contentDisposition = res.headers["content-disposition"];
  const filename = contentDisposition
    ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
    : "CV.pdf";
  
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  return res.data;
};

export const previewCv = async (): Promise<CvPreview> => {
  const res = await api.get("/cv/preview");
  return res.data;
};
