"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Achievement,
  deleteAchievement,
  getUserAchievements,
  updateAchievement,
} from "@/lib/achievement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  Globe,
  Lock,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

// ✅ Helper component for approval status
const ApprovalBadge = ({ isApproved }: { isApproved: boolean | any }) => {
  return isApproved ? (
    <Badge className="flex items-center gap-1 bg-green-500/15 text-green-700 dark:text-green-400">
      <CheckCircle className="size-3" /> Approved
    </Badge>
  ) : (
    <Badge className="flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400">
      <Clock className="size-3" /> Pending
    </Badge>
  );
};

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: getUserAchievements,
  });

  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      toast.success("Achievement deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete achievement.");
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({
      id,
      currentVisibility,
    }: {
      id: string;
      currentVisibility: string;
    }) => {
      const formData = new FormData();
      const newVisibility =
        currentVisibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
      formData.append("visibility", newVisibility);
      return updateAchievement(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      toast.success("Achievement visibility updated!");
    },
    onError: () => {
      toast.error("Failed to update visibility.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const filteredAchievements =
    achievements?.filter((a) =>
      selectedCategory === "all" ? true : a.category === selectedCategory,
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">
            Track your academic progress and celebrate your research milestones
          </p>
        </div>
        <Button asChild>
          <Link href="/app/achievements/create">
            <Plus className="mr-2 size-4" />
            Add Achievement
          </Link>
        </Button>
      </div>

      {/* Achievements */}
      {filteredAchievements.length > 0 ? (
        <div className="space-y-4">
          {filteredAchievements.map((achievement: Achievement) => (
            <Card
              key={achievement.id}
              className="transition-shadow hover:shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-amber-500/10 p-3">
                      <Award className="size-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="mb-2 cursor-pointer text-lg font-semibold hover:underline"
                        onClick={() => {
                          const params = new URLSearchParams({
                            type: "publication",
                            id: achievement.id,
                            title: achievement.title,
                            ...(achievement.fileUrl
                              ? { fileUrl: achievement.fileUrl }
                              : {}),
                          });
                          window.open(`/app/viewer?${params.toString()}`);
                        }}
                      >
                        {achievement.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                        {achievement.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-muted-foreground size-4" />
                          <span>
                            {new Date(achievement.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {achievement.visibility === "PUBLIC" ? (
                            <Globe className="size-4 text-green-600" />
                          ) : (
                            <Lock className="size-4 text-gray-500" />
                          )}
                          <span
                            className={
                              achievement.visibility === "PUBLIC"
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            {achievement.visibility}
                          </span>
                        </div>

                        {/* ✅ Approval badge */}
                        <ApprovalBadge isApproved={achievement.isApproved} />

                        {achievement.category && (
                          <Badge variant="outline">
                            {achievement.category}
                          </Badge>
                        )}

                        {achievement.fileUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(achievement.fileUrl!, "_blank");
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <FileText className="size-4" /> View attachment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/app/achievements/edit/${achievement.id}`}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 size-4" /> Edit
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          toggleVisibilityMutation.mutate({
                            id: achievement.id,
                            currentVisibility: achievement.visibility,
                          })
                        }
                        disabled={toggleVisibilityMutation.isPending}
                      >
                        {achievement.visibility === "PUBLIC" ? (
                          <>
                            <Lock className="mr-2 size-4" /> Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 size-4" /> Make Public
                          </>
                        )}
                      </DropdownMenuItem>

                      {achievement.fileUrl && (
                        <DropdownMenuItem asChild>
                          <a
                            href={achievement.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="mr-2 size-4" /> View File
                          </a>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 size-4 text-red-600" />
                            <span className="text-red-600">Delete</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Achievement
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete “
                              {achievement.title}”? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteMutation.mutate(achievement.id)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Award className="text-muted-foreground mx-auto mb-4 size-12" />
          <h3 className="mb-2 font-semibold">No achievements yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Start creating publications and participating in academic activities
            to earn achievements!
          </p>
          <Button asChild>
            <Link href="/app/achievements/create">
              <Plus className="mr-2 size-4" /> Create Achievement
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
