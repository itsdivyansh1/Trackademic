"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle, Plus, Trophy, Star, Target, Medal, BookOpen, Clock, Users, TrendingUp, Eye, ExternalLink, Calendar, FileText, Edit, Trash2, MoreVertical, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { getUserAchievements, deleteAchievement, updateAchievement } from "@/lib/achievement";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";


export default function AchievementsPage() {
  const { data: userAchievements, isLoading } = useQuery({ 
    queryKey: ["achievements"], 
    queryFn: getUserAchievements 
  });

  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const queryClient = useQueryClient();

  // Delete achievement mutation
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

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, currentVisibility }: { id: string, currentVisibility: string }) => {
      const formData = new FormData();
      const newVisibility = currentVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
      formData.append('visibility', newVisibility);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  // Use real achievements data or show empty state
  const achievements = userAchievements || [];

  // Calculate real stats
  const achievementStats = {
    totalEarned: achievements.length,
    totalPoints: 0, // Would calculate from achievement points if available
    totalAvailable: achievements.length || 0,
    completionRate: achievements.length > 0 ? 100 : 0,
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "text-amber-600 bg-amber-500/10";
      case "silver": return "text-gray-600 bg-gray-500/10";
      case "gold": return "text-yellow-600 bg-yellow-500/10";
      case "platinum": return "text-purple-600 bg-purple-500/10";
      default: return "text-blue-600 bg-blue-500/10";
    }
  };


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
            <Plus className="size-4 mr-2" />
            Add Achievement
          </Link>
        </Button>
      </div>

      {/* Achievement Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{achievementStats.totalEarned}</div>
                <div className="text-xs text-muted-foreground">Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="size-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{achievementStats.totalPoints}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold">{achievementStats.completionRate}%</div>
                <div className="text-xs text-muted-foreground">Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-violet-500" />
              <div>
                <div className="text-2xl font-bold">{achievementStats.totalAvailable}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Achievements */}
        <div className="space-y-4 lg:col-span-2">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === "earned" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("earned")}
            >
              Earned
            </Button>
            <Button
              variant={selectedCategory === "in-progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("in-progress")}
            >
              In Progress
            </Button>
            <Button
              variant={selectedCategory === "publications" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("publications")}
            >
              Publications
            </Button>
            <Button
              variant={selectedCategory === "impact" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("impact")}
            >
              Impact
            </Button>
            <Button
              variant={selectedCategory === "collaboration" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("collaboration")}
            >
              Collaboration
            </Button>
          </div>

          {/* Real Achievements */}
          {achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map((achievement: any) => (
                <Card
                  key={achievement.id}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => {
                    const params = new URLSearchParams({
                      type: 'achievement',
                      id: achievement.id,
                      title: achievement.title,
                      ...(achievement.fileUrl ? { fileUrl: achievement.fileUrl } : {}),
                    });
                    window.open(`/app/viewer?${params.toString()}`, '_blank');
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-amber-500/10">
                          <Award className="size-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4 text-muted-foreground" />
                              <span>{new Date(achievement.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {achievement.visibility === 'PUBLIC' ? (
                                <Globe className="size-4 text-green-600" />
                              ) : (
                                <Lock className="size-4 text-gray-500" />
                              )}
                              <span className={achievement.visibility === 'PUBLIC' ? 'text-green-600' : 'text-gray-500'}>
                                {achievement.visibility}
                              </span>
                            </div>
                            {achievement.category && (
                              <Badge variant="outline">{achievement.category}</Badge>
                            )}
                        {achievement.fileUrl && (
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(achievement.fileUrl, '_blank'); }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <FileText className="size-4" />
                            <span className="text-sm">View attachment</span>
                          </button>
                        )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/app/achievements/edit/${achievement.id}`} className="flex items-center">
                              <Edit className="size-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => toggleVisibilityMutation.mutate({ 
                              id: achievement.id, 
                              currentVisibility: achievement.visibility 
                            })}
                            disabled={toggleVisibilityMutation.isPending}
                          >
                            {achievement.visibility === 'PUBLIC' ? (
                              <>
                                <Lock className="size-4 mr-2" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Globe className="size-4 mr-2" />
                                Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          {achievement.fileUrl && (
                            <DropdownMenuItem asChild>
                              <a href={achievement.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <ExternalLink className="size-4 mr-2" />
                                View File
                              </a>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="size-4 mr-2 text-red-600" />
                                <span className="text-red-600">Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
                                <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{achievement.title}&rdquo;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(achievement.id)}
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
              <Award className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No achievements yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start creating publications and participating in academic activities to earn achievements!
              </p>
              <Button asChild>
                <Link href="/app/achievements/create">
                  <Plus className="size-4 mr-2" />
                  Create Achievement
                </Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements
                    .slice(0, 3)
                    .map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-amber-500/10">
                          <Award className="size-3 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{achievement.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(achievement.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No achievements yet</p>
              )}
            </CardContent>
          </Card>

          {/* Achievement Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { category: "publications", label: "Publications", icon: BookOpen },
                  { category: "awards", label: "Awards", icon: Trophy },
                  { category: "research", label: "Research", icon: Star },
                  { category: "collaboration", label: "Collaboration", icon: Users },
                  { category: "academic", label: "Academic", icon: Target },
                ].map((cat) => {
                  const IconComponent = cat.icon;
                  const count = achievements.filter((a: any) => a.category === cat.category).length;
                  return (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="size-4 text-muted-foreground" />
                        <span className="text-sm">{cat.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
