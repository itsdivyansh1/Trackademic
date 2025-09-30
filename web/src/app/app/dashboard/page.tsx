"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, TrendingUp, Target, Activity } from "lucide-react";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { getUserAchievements } from "@/lib/achievement";
import { getUserPublications } from "@/lib/publication";
import * as React from "react";


export default function DashboardPage() {
  const { data: achievements, isLoading: achLoading } = useQuery({ 
    queryKey: ["achievements"], 
    queryFn: getUserAchievements 
  });
  const { data: publications, isLoading: pubLoading } = useQuery({ 
    queryKey: ["publications"], 
    queryFn: getUserPublications 
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
          type: "publication"
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
          type: "achievement"
        });
      });
    }
    
    // Sort by date, most recent first
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [publications, achievements]);

  // Loading state
  const isLoading = achLoading || pubLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <StatCard 
          title="Active Projects" 
          value={totalProjects} 
          delta={0} 
          icon={<Target className="size-4" />} 
          accent="bg-blue-500/15 text-blue-500" 
        />
        <StatCard 
          title="H-Index" 
          value={hIndex} 
          delta={0} 
          icon={<TrendingUp className="size-4" />} 
          accent="bg-emerald-500/15 text-emerald-500" 
        />
      </div>

      {/* Recent Activity */}
      {academicActivities.length > 0 ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {academicActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                  {activity.type === 'publication' && <BookOpen className="size-4 text-violet-500" />}
                  {activity.type === 'achievement' && <Award className="size-4 text-amber-500" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {activity.date ? new Date(activity.date).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
          <div className="text-muted-foreground mb-4">
            <Activity className="size-12 mx-auto mb-2" />
            <h3 className="font-medium">No recent activity</h3>
            <p className="text-sm">Start by creating your first publication or achievement!</p>
          </div>
        </div>
      )}

    </div>
  );
}
