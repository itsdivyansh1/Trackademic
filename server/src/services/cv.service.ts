import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.conf";
import { CvData, CvExportOptions, CvGenerationResult } from "../types/cv.types";
import PDFDocument from "pdfkit";
import { uploadBufferToS3 } from "../utils/uploadBufferToS3";

// Create or update CV data
export const createOrUpdateCvData = async (
  userId: string,
  cvData: Partial<CvData>
): Promise<any> => {
  // Filter out undefined values and ensure required fields
  const cleanData: any = {};
  Object.entries(cvData).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });

  return prisma.cvData.upsert({
    where: { userId },
    update: {
      ...cleanData,
      updatedAt: new Date(),
    },
    create: {
      userId,
      fullName: cvData.fullName || "",
      template: cvData.template || "MODERN",
      includePhoto: cvData.includePhoto ?? true,
      includeAddress: cvData.includeAddress ?? true,
      includeSummary: cvData.includeSummary ?? true,
      ...cleanData,
    },
  });
};

// Get CV data for user
export const getCvData = async (userId: string): Promise<any> => {
  return prisma.cvData.findUnique({
    where: { userId },
  });
};

// Delete CV data
export const deleteCvData = async (userId: string): Promise<void> => {
  await prisma.cvData.delete({
    where: { userId },
  });
};

// Generate CV PDF
export const generateCvPdf = async (
  userId: string,
  options: CvExportOptions
): Promise<CvGenerationResult> => {
  try {
    // Get user data with CV data, publications, and achievements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cvData: true,
        publications: {
          where: { visibility: "PUBLIC", isApproved: true },
          orderBy: { publicationYear: "desc" },
          take: options.maxPublications,
        },
        achievements: {
          where: { visibility: "PUBLIC", isApproved: true },
          orderBy: { date: "desc" },
          take: options.maxAchievements,
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.cvData) {
      return { success: false, error: "CV data not found. Please complete your CV information first." };
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    
    return new Promise(async (resolve) => {
      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          
          // Generate filename
          const fileName = `${user.cvData!.fullName.replace(/\s+/g, "_")}_CV_${new Date().toISOString().split("T")[0]}.pdf`;
          
          // Upload to S3
          const s3Key = await uploadBufferToS3(pdfBuffer, fileName);
          
          resolve({
            success: true,
            pdfBuffer,
            fileName,
          });
        } catch (error) {
          resolve({
            success: false,
            error: `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      });

      // Generate PDF content based on template
      await generatePdfContent(doc, user, options);
      doc.end();
    });
  } catch (error) {
    return {
      success: false,
      error: `CV generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

// Generate PDF content based on template
async function generatePdfContent(doc: InstanceType<typeof PDFDocument>, user: any, options: CvExportOptions): Promise<void> {
  const cvData = user.cvData;
  
  // Set font
  doc.font("Helvetica");
  
  // Header section
  await generateHeader(doc, cvData, options);
  
  // Summary section - only show if has actual content
  if (options.includeSummary && cvData.summary && cvData.summary.trim().length > 0) {
    await generateSummary(doc, cvData.summary);
  }
  
  // Experience section - only show if has valid entries
  if (cvData.experience && Array.isArray(cvData.experience) && cvData.experience.length > 0) {
    const validExperience = cvData.experience.filter((exp: any) => 
      exp.company && exp.position && exp.startDate
    );
    if (validExperience.length > 0) {
      await generateExperience(doc, validExperience);
    }
  }
  
  // Education section - only show if has valid entries
  if (cvData.education && Array.isArray(cvData.education) && cvData.education.length > 0) {
    const validEducation = cvData.education.filter((edu: any) => 
      edu.institution && edu.degree && edu.field && edu.startDate
    );
    if (validEducation.length > 0) {
      await generateEducation(doc, validEducation);
    }
  }
  
  // Skills section - only show if has valid entries
  if (cvData.skills && Array.isArray(cvData.skills) && cvData.skills.length > 0) {
    const validSkills = cvData.skills.filter((skill: any) => 
      skill.name && skill.name.trim().length > 0
    );
    if (validSkills.length > 0) {
      await generateSkills(doc, validSkills);
    }
  }
  
  // Publications section - only show if has publications
  if (options.includePublications && user.publications && user.publications.length > 0) {
    await generatePublications(doc, user.publications);
  }
  
  // Achievements section - only show if has achievements
  if (options.includeAchievements && user.achievements && user.achievements.length > 0) {
    await generateAchievements(doc, user.achievements);
  }
  
  // Certifications section - only show if has valid entries
  if (cvData.certifications && Array.isArray(cvData.certifications) && cvData.certifications.length > 0) {
    const validCertifications = cvData.certifications.filter((cert: any) => 
      cert.name && cert.issuer && cert.issueDate
    );
    if (validCertifications.length > 0) {
      await generateCertifications(doc, validCertifications);
    }
  }
  
  // Languages section - only show if has valid entries
  if (cvData.languages && Array.isArray(cvData.languages) && cvData.languages.length > 0) {
    const validLanguages = cvData.languages.filter((lang: any) => 
      lang.name && lang.proficiency
    );
    if (validLanguages.length > 0) {
      await generateLanguages(doc, validLanguages);
    }
  }
}

// Generate header section
async function generateHeader(doc: InstanceType<typeof PDFDocument>, cvData: any, options: CvExportOptions): Promise<void> {
  // Name
  doc.fontSize(24)
     .font("Helvetica-Bold")
     .text(cvData.fullName, { align: "center" });
  
  // Title - only show if has actual content
  if (cvData.title && cvData.title.trim().length > 0) {
    doc.fontSize(14)
       .font("Helvetica")
       .text(cvData.title, { align: "center" });
  }
  
  // Contact information - only show if has actual content
  const contactInfo = [];
  if (cvData.email && cvData.email.trim()) contactInfo.push(cvData.email);
  if (cvData.phone && cvData.phone.trim()) contactInfo.push(cvData.phone);
  if (options.includeAddress && cvData.address && cvData.address.trim()) contactInfo.push(cvData.address);
  
  // Add URLs as clickable links
  if (cvData.website && cvData.website.trim()) {
    contactInfo.push(cvData.website);
  }
  if (cvData.linkedin && cvData.linkedin.trim()) {
    contactInfo.push(cvData.linkedin);
  }
  if (cvData.github && cvData.github.trim()) {
    contactInfo.push(cvData.github);
  }
  
  if (contactInfo.length > 0) {
    doc.fontSize(10);
    
    // Split contact info into lines if too long
    const maxWidth = 500; // Approximate max width for A4
    let currentLine = "";
    
    for (let i = 0; i < contactInfo.length; i++) {
      const item = contactInfo[i];
      const separator = i < contactInfo.length - 1 ? " • " : "";
      const testLine = currentLine + item + separator;
      
      // Check if this is a URL and make it clickable
      if (item.startsWith('http://') || item.startsWith('https://')) {
        // For URLs, we'll add them as clickable links
        if (currentLine) {
          doc.text(currentLine, { align: "center" });
          currentLine = "";
        }
        doc.text(item, { 
          align: "center",
          link: item,
          underline: true
        });
        if (i < contactInfo.length - 1) {
          doc.text(" • ", { align: "center" });
        }
      } else {
        if (testLine.length * 6 > maxWidth && currentLine) { // Rough character width estimation
          doc.text(currentLine, { align: "center" });
          currentLine = item + separator;
        } else {
          currentLine = testLine;
        }
      }
    }
    
    if (currentLine) {
      doc.text(currentLine, { align: "center" });
    }
  }
  
  // Add spacing
  doc.moveDown(2);
}

// Generate summary section
async function generateSummary(doc: InstanceType<typeof PDFDocument>, summary: string): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Professional Summary");
  
  doc.fontSize(11)
     .font("Helvetica")
     .text(summary, { align: "justify" });
  
  doc.moveDown(1);
}

// Generate experience section
async function generateExperience(doc: InstanceType<typeof PDFDocument>, experience: any[]): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Professional Experience");
  
  experience.forEach((exp) => {
    doc.fontSize(12)
       .font("Helvetica-Bold")
       .text(`${exp.position} at ${exp.company}`);
    
    const dateRange = exp.isCurrent 
      ? `${exp.startDate} - Present`
      : `${exp.startDate} - ${exp.endDate || "Present"}`;
    
    doc.fontSize(10)
       .font("Helvetica")
       .text(dateRange);
    
    if (exp.location) {
      doc.text(exp.location);
    }
    
    if (exp.description) {
      doc.fontSize(10)
         .text(exp.description, { align: "justify" });
    }
    
    if (exp.achievements && Array.isArray(exp.achievements)) {
      exp.achievements.forEach((achievement: string) => {
        doc.text(`• ${achievement}`);
      });
    }
    
    doc.moveDown(0.5);
  });
  
  doc.moveDown(1);
}

// Generate education section
async function generateEducation(doc: InstanceType<typeof PDFDocument>, education: any[]): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Education");
  
  education.forEach((edu) => {
    doc.fontSize(12)
       .font("Helvetica-Bold")
       .text(`${edu.degree} in ${edu.field}`);
    
    doc.fontSize(11)
       .font("Helvetica")
       .text(edu.institution);
    
    const dateRange = edu.isCurrent 
      ? `${edu.startDate} - Present`
      : `${edu.startDate} - ${edu.endDate || "Present"}`;
    
    doc.fontSize(10)
       .text(dateRange);
    
    if (edu.gpa) {
      doc.text(`GPA: ${edu.gpa}`);
    }
    
    if (edu.description) {
      doc.text(edu.description, { align: "justify" });
    }
    
    doc.moveDown(0.5);
  });
  
  doc.moveDown(1);
}

// Generate skills section
async function generateSkills(doc: InstanceType<typeof PDFDocument>, skills: any[]): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Skills");
  
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});
  
  Object.entries(skillsByCategory).forEach(([category, categorySkills]: [string, any]) => {
    doc.fontSize(11)
       .font("Helvetica-Bold")
       .text(category);
    
    const skillNames = categorySkills.map((skill: any) => skill.name).join(", ");
    doc.fontSize(10)
       .font("Helvetica")
       .text(skillNames);
    
    doc.moveDown(0.3);
  });
  
  doc.moveDown(1);
}

// Generate publications section
async function generatePublications(doc: InstanceType<typeof PDFDocument>, publications: any[]): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Publications");
  
  publications.forEach((pub) => {
    doc.fontSize(11)
       .font("Helvetica-Bold")
       .text(pub.title);
    
    if (pub.authors) {
      const authors = Array.isArray(pub.authors) 
        ? pub.authors.join(", ")
        : pub.authors;
      doc.fontSize(10)
         .font("Helvetica")
         .text(authors);
    }
    
    doc.fontSize(10)
       .text(`${pub.journalConference}, ${pub.publicationYear}`);
    
    if (pub.doi) {
      doc.text(`DOI: ${pub.doi}`);
    }
    
    doc.moveDown(0.5);
  });
  
  doc.moveDown(1);
}

// Generate achievements section
async function generateAchievements(doc: InstanceType<typeof PDFDocument>, achievements: any[]): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Achievements");
  
  achievements.forEach((ach: any) => {
    doc.fontSize(11)
       .font("Helvetica-Bold")
       .text(ach.title);
    
    doc.fontSize(10)
       .font("Helvetica")
       .text(ach.description);
    
    doc.fontSize(9)
       .text(new Date(ach.date).toLocaleDateString());
    
    doc.moveDown(0.5);
  });
  
  doc.moveDown(1);
}

// Generate certifications section
async function generateCertifications(doc: InstanceType<typeof PDFDocument>, certifications: any[]): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Certifications");
  
  certifications.forEach((cert) => {
    doc.fontSize(11)
       .font("Helvetica-Bold")
       .text(cert.name);
    
    doc.fontSize(10)
       .font("Helvetica")
       .text(cert.issuer);
    
    doc.fontSize(9)
       .text(`Issued: ${cert.issueDate}`);
    
    if (cert.expiryDate) {
      doc.text(`Expires: ${cert.expiryDate}`);
    }
    
    doc.moveDown(0.5);
  });
  
  doc.moveDown(1);
}

// Generate languages section
async function generateLanguages(doc: InstanceType<typeof PDFDocument>, languages: any[]): Promise<void> {
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .text("Languages");
  
  languages.forEach((lang) => {
    doc.fontSize(10)
       .font("Helvetica")
       .text(`${lang.name} - ${lang.proficiency}`);
  });
  
  doc.moveDown(1);
}
