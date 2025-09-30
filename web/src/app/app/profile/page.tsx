"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Mail,
  Award,
  BookOpen,
  Edit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfile } from "@/lib/auth";


export default function ProfilePage() {
  const { data: userData, isLoading } = useQuery({ 
    queryKey: ["profile"], 
    queryFn: getProfile 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Profile not found</h3>
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center sm:items-start gap-4">
              <Avatar className="size-32 border-4 border-background shadow-lg">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-2xl">
                  {user.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{user.name || "User"}</h1>
                  {user.isApproved && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-violet-500 text-white">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Role: {user.role}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-1">
              <div className="flex gap-2">
                <Button>
                  <Edit className="size-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline">
                  <Mail className="size-4 mr-2" />
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
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{user.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-sm capitalize">{user.role?.toLowerCase()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
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
              <BookOpen className="size-4 mr-2" />
              Add Publication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Award className="size-4 mr-2" />
              Add Achievement
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="size-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}