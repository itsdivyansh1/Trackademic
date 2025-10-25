"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, Edit, Mail } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

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

  const user = userData?.user;
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
                <AvatarImage src={user.profileImage} />
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

      {/* Simple Profile Content */}
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
            <Button className="w-full justify-start">
              <BookOpen className="mr-2 size-4" />
              Add Publication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Award className="mr-2 size-4" />
              Add Achievement
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="mr-2 size-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
