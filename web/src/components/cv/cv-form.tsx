"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Save, Download, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CvData,
  EducationEntry,
  ExperienceEntry,
  SkillEntry,
  LanguageEntry,
  CertificationEntry,
  createOrUpdateCvData,
  getCvData,
  generateCvPdf,
  previewCv,
} from "@/lib/cv";

// Validation schemas
const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  description: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  isCurrent: z.boolean().default(false),
});

const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  category: z.string().optional(),
});

const languageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Language name is required"),
  proficiency: z.enum(["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "NATIVE"]),
});

const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const cvDataSchema = z.object({
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
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  skills: z.array(skillSchema).optional(),
  languages: z.array(languageSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  template: z.enum(["MODERN", "CLASSIC", "MINIMAL", "CREATIVE"]).default("MODERN"),
  includePhoto: z.boolean().default(true),
  includeAddress: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
});

type CvFormData = z.infer<typeof cvDataSchema>;

export function CvForm() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const queryClient = useQueryClient();

  // Fetch existing CV data
  const { data: cvData, isLoading } = useQuery({
    queryKey: ["cvData"],
    queryFn: getCvData,
  });

  // Form setup
  const form = useForm<CvFormData>({
    resolver: zodResolver(cvDataSchema),
    defaultValues: {
      fullName: "",
      title: "",
      summary: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      website: "",
      linkedin: "",
      github: "",
      education: [],
      experience: [],
      skills: [],
      languages: [],
      certifications: [],
      template: "MODERN",
      includePhoto: true,
      includeAddress: true,
      includeSummary: true,
    },
  });

  // Field arrays for dynamic sections
  const educationFields = useFieldArray({
    control: form.control,
    name: "education",
  });

  const experienceFields = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const skillFields = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const languageFields = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const certificationFields = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: createOrUpdateCvData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cvData"] });
      toast.success("CV data saved successfully!");
    },
    onError: (error: any) => {
      // Handle validation errors with user-friendly messages
      if (error.response?.data) {
        const responseData = error.response.data;
        
        if (responseData.details && Array.isArray(responseData.details)) {
          // Handle formatted validation errors from backend
          const errorMessages = responseData.details.map((err: any) => {
            const fieldName = err.field.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
            return `${fieldName}: ${err.message}`;
          });
          toast.error(`Please fix the following errors:\n${errorMessages.join('\n')}`);
        } else if (responseData.error) {
          toast.error(responseData.error);
        } else {
          toast.error("Failed to save CV data");
        }
      } else {
        toast.error("Failed to save CV data");
      }
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateCvPdf,
    onSuccess: () => {
      toast.success("CV generated and downloaded successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to generate CV");
    },
  });

  // Load existing data when available
  React.useEffect(() => {
    if (cvData?.cvData) {
      form.reset(cvData.cvData);
    }
  }, [cvData, form]);

  const onSubmit = (data: CvFormData) => {
    saveMutation.mutate(data);
  };

  const handleGenerateCv = () => {
    const formData = form.getValues();
    generateMutation.mutate({
      template: formData.template,
      includePhoto: formData.includePhoto,
      includeAddress: formData.includeAddress,
      includeSummary: formData.includeSummary,
      includePublications: true,
      includeAchievements: true,
      maxPublications: 10,
      maxAchievements: 10,
    });
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading CV data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">CV Builder</h1>
          <p className="text-muted-foreground">
            Create and manage your professional CV with your publications and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 size-4" />
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button onClick={handleGenerateCv} disabled={generateMutation.isPending}>
            <Download className="mr-2 size-4" />
            {generateMutation.isPending ? "Generating..." : "Download CV"}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder="John Doe"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                {...form.register("summary")}
                placeholder="Brief description of your professional background..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="New York"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...form.register("state")}
                  placeholder="NY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...form.register("country")}
                  placeholder="USA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  {...form.register("postalCode")}
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...form.register("website")}
                  placeholder="https://johndoe.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...form.register("linkedin")}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  {...form.register("github")}
                  placeholder="https://github.com/johndoe"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Education</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => educationFields.append({
                  institution: "",
                  degree: "",
                  field: "",
                  startDate: "",
                  endDate: "",
                  gpa: "",
                  description: "",
                  isCurrent: false,
                })}
              >
                <Plus className="mr-2 size-4" />
                Add Education
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {educationFields.fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Education Entry {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => educationFields.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Institution *</Label>
                      <Input
                        {...form.register(`education.${index}.institution`)}
                        placeholder="University Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree *</Label>
                      <Input
                        {...form.register(`education.${index}.degree`)}
                        placeholder="Bachelor of Science"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="space-y-2">
                      <Label>Field of Study *</Label>
                      <Input
                        {...form.register(`education.${index}.field`)}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA</Label>
                      <Input
                        {...form.register(`education.${index}.gpa`)}
                        placeholder="3.8"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        {...form.register(`education.${index}.startDate`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        {...form.register(`education.${index}.endDate`)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Description</Label>
                    <Textarea
                      {...form.register(`education.${index}.description`)}
                      placeholder="Additional details about your education..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Professional Experience</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => experienceFields.append({
                  company: "",
                  position: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                  achievements: [],
                  isCurrent: false,
                })}
              >
                <Plus className="mr-2 size-4" />
                Add Experience
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {experienceFields.fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Experience Entry {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => experienceFields.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input
                        {...form.register(`experience.${index}.company`)}
                        placeholder="Company Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position *</Label>
                      <Input
                        {...form.register(`experience.${index}.position`)}
                        placeholder="Job Title"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        {...form.register(`experience.${index}.location`)}
                        placeholder="City, State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        {...form.register(`experience.${index}.startDate`)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      {...form.register(`experience.${index}.endDate`)}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label>Description</Label>
                    <Textarea
                      {...form.register(`experience.${index}.description`)}
                      placeholder="Describe your role and responsibilities..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skills</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => skillFields.append({
                  name: "",
                  level: "INTERMEDIATE",
                  category: "",
                })}
              >
                <Plus className="mr-2 size-4" />
                Add Skill
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4">
                <div className="flex-1 grid gap-4 md:grid-cols-3">
                  <Input
                    {...form.register(`skills.${index}.name`)}
                    placeholder="Skill name"
                  />
                  <Select
                    value={form.watch(`skills.${index}.level`) || "INTERMEDIATE"}
                    onValueChange={(value) => form.setValue(`skills.${index}.level`, value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    {...form.register(`skills.${index}.category`)}
                    placeholder="Category (optional)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => skillFields.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CV Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>CV Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select
                  value={form.watch("template") || "MODERN"}
                  onValueChange={(value) => form.setValue("template", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MODERN">Modern</SelectItem>
                    <SelectItem value="CLASSIC">Classic</SelectItem>
                    <SelectItem value="MINIMAL">Minimal</SelectItem>
                    <SelectItem value="CREATIVE">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includePhoto"
                  {...form.register("includePhoto")}
                  className="rounded"
                />
                <Label htmlFor="includePhoto">Include profile photo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeAddress"
                  {...form.register("includeAddress")}
                  className="rounded"
                />
                <Label htmlFor="includeAddress">Include address</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeSummary"
                  {...form.register("includeSummary")}
                  className="rounded"
                />
                <Label htmlFor="includeSummary">Include professional summary</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="mr-2 size-4" />
            {saveMutation.isPending ? "Saving..." : "Save CV Data"}
          </Button>
        </div>
      </form>
    </div>
  );
}
