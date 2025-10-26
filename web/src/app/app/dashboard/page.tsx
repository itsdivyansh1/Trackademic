"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { getUserAchievements } from "@/lib/achievement";
import { getUserPublications } from "@/lib/publication";
import { useQuery } from "@tanstack/react-query";
import { Activity, Award, BookOpen, Target, TrendingUp } from "lucide-react";
import * as React from "react";

export default function DashboardPage() {
  const { data: achievements, isLoading: achLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: getUserAchievements,
  });
  const { data: publications, isLoading: pubLoading } = useQuery({
    queryKey: ["publications"],
    queryFn: getUserPublications,
  });

  // Use real data or provide fallback
  const ach = achievements?.length ?? 0;
  const pub = publications?.length ?? 0;
  const totalProjects = 0; // Will be calculated from real project data
  const hIndex = 0; // Will be calculated from real citation data

  // Create activity feed from real data
  const academicActivities = React.useMemo(() => {
    const activities: any[] = [];

    // Add recent publications
    if (publications && publications.length > 0) {
      publications.slice(-3).forEach((pub: any) => {
        activities.push({
          id: `pub-${pub.id}`,
          title: `Published: ${pub.title}`,
          date: pub.publishedAt || pub.createdAt,
          amount: 1,
          type: "publication",
        });
      });
    }

    // Add recent achievements
    if (achievements && achievements.length > 0) {
      achievements.slice(-3).forEach((ach: any) => {
        activities.push({
          id: `ach-${ach.id}`,
          title: `Achievement: ${ach.title}`,
          date: ach.date || ach.createdAt,
          amount: 1,
          type: "achievement",
        });
      });
    }

    // Sort by date, most recent first
    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [publications, achievements]);

  // Loading state
  const isLoading = achLoading || pubLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Metrics Overview */}
      <div className="grid gap-4 grid-cols-2">
        <StatCard
          title="Publications"
          value={pub}
          delta={0}
          icon={<BookOpen className="size-4" />}
          accent="bg-violet-500/15 text-violet-500"
        />
        <StatCard
          title="Achievements"
          value={ach}
          delta={0}
          icon={<Award className="size-4" />}
          accent="bg-amber-500/15 text-amber-500"
        />
      </div>

      {/* Recent Activity */}
      {academicActivities.length > 0 ? (
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Recent Activity</h3>
          <div className="space-y-4">
            {academicActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="bg-secondary/50 flex items-center gap-3 rounded-lg p-3"
              >
                <div className="bg-secondary flex size-8 items-center justify-center rounded-full">
                  {activity.type === "publication" && (
                    <BookOpen className="size-4 text-violet-500" />
                  )}
                  {activity.type === "achievement" && (
                    <Award className="size-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {activity.date
                      ? new Date(activity.date).toLocaleDateString()
                      : "Recently"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-8 text-center shadow-sm">
          <div className="text-muted-foreground mb-4">
            <Activity className="mx-auto mb-2 size-12" />
            <h3 className="font-medium">No recent activity</h3>
            <p className="text-sm">
              Start by creating your first publication or achievement!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
