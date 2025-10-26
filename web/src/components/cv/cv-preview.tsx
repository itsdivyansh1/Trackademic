"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Edit } from "lucide-react";
import { CvPreview } from "@/lib/cv";
import { generateCvPdf } from "@/lib/cv";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CvPreviewProps {
  data: CvPreview;
  onEdit: () => void;
}

export function CvPreviewComponent({ data, onEdit }: CvPreviewProps) {
  const generateMutation = useMutation({
    mutationFn: generateCvPdf,
    onSuccess: () => {
      toast.success("CV generated and downloaded successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to generate CV");
    },
  });

  const handleGenerateCv = () => {
    generateMutation.mutate({
      template: data.cvData?.template || "MODERN",
      includePhoto: data.cvData?.includePhoto ?? true,
      includeAddress: data.cvData?.includeAddress ?? true,
      includeSummary: data.cvData?.includeSummary ?? true,
      includePublications: true,
      includeAchievements: true,
      maxPublications: 10,
      maxAchievements: 10,
    });
  };

  if (!data.cvData) {
    return (
      <Card className="p-8 text-center">
        <h3 className="mb-2 text-lg font-semibold">No CV Data Found</h3>
        <p className="text-muted-foreground mb-4">
          Please complete your CV information to see a preview.
        </p>
        <Button onClick={onEdit}>
          <Edit className="mr-2 size-4" />
          Create CV
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">CV Preview</h1>
          <p className="text-muted-foreground">
            Preview your CV before generating the PDF
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 size-4" />
            Edit CV
          </Button>
          <Button onClick={handleGenerateCv} disabled={generateMutation.isPending}>
            <Download className="mr-2 size-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* CV Preview */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{data.cvData.fullName}</h1>
            {data.cvData.title && (
              <p className="text-lg text-muted-foreground mb-4">{data.cvData.title}</p>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {data.cvData.address && data.cvData.includeAddress && (
                <span>{data.cvData.address}</span>
              )}
              {data.cvData.city && <span>{data.cvData.city}</span>}
              {data.cvData.state && <span>{data.cvData.state}</span>}
              {data.cvData.country && <span>{data.cvData.country}</span>}
              {data.cvData.postalCode && <span>{data.cvData.postalCode}</span>}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm mt-2">
              {data.cvData.website && data.cvData.website.trim() && (
                <a href={data.cvData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Website
                </a>
              )}
              {data.cvData.linkedin && data.cvData.linkedin.trim() && (
                <a href={data.cvData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn
                </a>
              )}
              {data.cvData.github && data.cvData.github.trim() && (
                <a href={data.cvData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {data.cvData.summary && data.cvData.summary.trim().length > 0 && data.cvData.includeSummary && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Professional Summary</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {data.cvData.summary}
                </p>
              </div>
            </>
          )}

          {/* Education */}
          {data.cvData.education && data.cvData.education.length > 0 && (() => {
            const validEducation = data.cvData.education.filter(edu => 
              edu.institution && edu.degree && edu.field && edu.startDate
            );
            return validEducation.length > 0 ? (
              <>
                <Separator className="my-6" />
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Education</h2>
                  <div className="space-y-4">
                    {validEducation.map((edu, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.startDate} - {edu.endDate || "Present"}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </p>
                        {edu.description && (
                          <p className="text-sm mt-2">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null;
          })()}

          {/* Experience */}
          {data.cvData.experience && data.cvData.experience.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
                <div className="space-y-4">
                  {data.cvData.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold">{exp.position} at {exp.company}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exp.startDate} - {exp.endDate || "Present"}
                        {exp.location && ` • ${exp.location}`}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="text-sm mt-2 list-disc list-inside">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Skills */}
          {data.cvData.skills && data.cvData.skills.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.cvData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.name} ({skill.level})
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Publications */}
          {data.publications && data.publications.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Publications</h2>
                <div className="space-y-3">
                  {data.publications.map((pub, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(pub.authors) ? pub.authors.join(", ") : pub.authors}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pub.journalConference}, {pub.publicationYear}
                      </p>
                      {pub.doi && (
                        <p className="text-sm text-blue-600">
                          DOI: {pub.doi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Achievements</h2>
                <div className="space-y-3">
                  {data.achievements.map((ach, index) => (
                    <div key={index} className="border-l-4 border-yellow-500 pl-4">
                      <h3 className="font-semibold">{ach.title}</h3>
                      <p className="text-sm text-muted-foreground">{ach.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ach.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Languages */}
          {data.cvData.languages && data.cvData.languages.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {data.cvData.languages.map((lang, index) => (
                    <Badge key={index} variant="outline">
                      {lang.name} - {lang.proficiency}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Certifications */}
          {data.cvData.certifications && data.cvData.certifications.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                <div className="space-y-3">
                  {data.cvData.certifications.map((cert, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      <p className="text-sm text-muted-foreground">
                        Issued: {cert.issueDate}
                        {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
