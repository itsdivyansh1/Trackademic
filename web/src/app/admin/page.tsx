"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Award, BookOpen, TrendingUp, Loader } from "lucide-react";

export default function AdminDashboardPage() {
  const usersStats = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/users/stats");
      return res.data as {
        total: number;
        approved: number;
        pending: number;
        students: number;
        faculty: number;
        admins: number;
      };
    },
  });

  const achievementsQuery = useQuery({
    queryKey: ["admin-achievements"],
    queryFn: async () => {
      const res = await api.get("/admin/achievements");
      return res.data as any[];
    },
  });

  const publicationsQuery = useQuery({
    queryKey: ["admin-publications"],
    queryFn: async () => {
      const res = await api.get("/admin/publications");
      return res.data as any[];
    },
  });

  const a = achievementsQuery.data || [];
  const p = publicationsQuery.data || [];

  const achievementCounts = React.useMemo(() => ({
    total: a.length,
    approved: a.filter((x: any) => x.isApproved).length,
    pending: a.filter((x: any) => !x.isApproved).length,
  }), [a]);

  const publicationCounts = React.useMemo(() => ({
    total: p.length,
    approved: p.filter((x: any) => x.isApproved).length,
    pending: p.filter((x: any) => !x.isApproved).length,
  }), [p]);

  const recentAchievements = a.slice(0, 5);
  const recentPublications = p.slice(0, 5);

  const loading = usersStats.isLoading || achievementsQuery.isLoading || publicationsQuery.isLoading;
  const errored = usersStats.isError || achievementsQuery.isError || publicationsQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of users, achievements, and publications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline"><Link href="/admin/achievements">Manage Achievements</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/publications">Manage Publications</Link></Button>
          <Button asChild><Link href="/admin/users">Manage Users</Link></Button>
        </div>
      </div>

      {loading ? (
        <div className="grid place-content-center py-24"><Loader className="size-6 animate-spin" /></div>
      ) : errored ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">Failed to load dashboard data.</CardContent>
        </Card>
      ) : (
        <>
          {/* Top stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-500/10"><Users className="size-5 text-blue-600" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total Users</div>
                    <div className="text-2xl font-bold">{usersStats.data?.total ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Approved {usersStats.data?.approved ?? 0} · Pending {usersStats.data?.pending ?? 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-amber-500/10"><Award className="size-5 text-amber-600" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                    <div className="text-2xl font-bold">{achievementCounts.total}</div>
                    <div className="text-xs text-muted-foreground">Approved {achievementCounts.approved} · Pending {achievementCounts.pending}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-violet-500/10"><BookOpen className="size-5 text-violet-600" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Publications</div>
                    <div className="text-2xl font-bold">{publicationCounts.total}</div>
                    <div className="text-xs text-muted-foreground">Approved {publicationCounts.approved} · Pending {publicationCounts.pending}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User composition */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Users by Role</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Students</div>
                  <div className="text-xl font-semibold">{usersStats.data?.students ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Faculty</div>
                  <div className="text-xl font-semibold">{usersStats.data?.faculty ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Admins</div>
                  <div className="text-xl font-semibold">{usersStats.data?.admins ?? 0}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><TrendingUp className="size-4" /> Track approvals and pending items from the lists below.</div>
                <div>Use the Manage buttons above to review and approve content.</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent content */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAchievements.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No achievements found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>By</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentAchievements.map((r: any) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.title}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{r.user?.name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {r.isApproved ? (
                                <Badge variant="outline">Approved</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Publications</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPublications.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No publications found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>By</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentPublications.map((r: any) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.title}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{r.user?.name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {r.isApproved ? (
                                <Badge variant="outline">Approved</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}