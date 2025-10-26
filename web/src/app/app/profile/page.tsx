"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfile } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, Edit, Mail, FileText, Download } from "lucide-react";
import Link from "next/link";
import { CvForm } from "@/components/cv/cv-form";
import { CvPreviewComponent } from "@/components/cv/cv-preview";
import { previewCv } from "@/lib/cv";
import { useS3Url } from "@/hooks/use-s3-url";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });

  const user = userData?.user;
  
  const { data: cvPreviewData } = useQuery({
    queryKey: ["cvPreview"],
    queryFn: previewCv,
    enabled: activeTab === "cv",
  });

  const profileImageUrl = useS3Url(user?.profileImage);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">Profile not found</h3>
        <p className="text-muted-foreground">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center gap-4 sm:items-start">
              <Avatar className="border-background size-32 border-4 shadow-lg">
                <AvatarImage src={profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {user.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="text-center sm:text-left">
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user.name || "User"}</h1>
                  {user.isApproved && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-violet-500 text-white">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span>Role: {user.role}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-1">
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={"/app/settings"}>
                    <Edit className="mr-2 size-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 size-4" />
                  {user.email}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Profile and CV */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="cv">CV Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Content */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Name
                  </label>
                  <p className="text-sm">{user.name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Email
                  </label>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Role
                  </label>
                  <p className="text-sm capitalize">{user.role?.toLowerCase()}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Status
                  </label>
                  <Badge variant={user.isApproved ? "default" : "secondary"}>
                    {user.isApproved ? "Approved" : "Pending Approval"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/app/publications/create">
                    <BookOpen className="mr-2 size-4" />
                    Add Publication
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/app/achievements/create">
                    <Award className="mr-2 size-4" />
                    Add Achievement
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/app/settings">
                    <Edit className="mr-2 size-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("cv")}
                >
                  <FileText className="mr-2 size-4" />
                  Build CV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cv" className="space-y-6">
          {/* CV Builder Content */}
          {isPreviewMode ? (
            <CvPreviewComponent 
              data={cvPreviewData || { cvData: null, publications: [], achievements: [] }}
              onEdit={() => setIsPreviewMode(false)}
            />
          ) : (
            <CvForm />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
