"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, ExternalLink, Loader } from "lucide-react";

export default function AdminAchievementsPage() {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<"all" | "approved" | "pending">("all");
  const [visibilityFilter, setVisibilityFilter] = React.useState<"all" | "PUBLIC" | "PRIVATE">("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-achievements"],
    queryFn: async () => {
      const res = await api.get("/admin/achievements");
      return res.data as any[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/achievements/${id}/approve`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-achievements"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/achievements/${id}/reject`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-achievements"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/achievements/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-achievements"] }),
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Achievements</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>All</Button>
              <Button size="sm" variant={statusFilter === "approved" ? "default" : "outline"} onClick={() => setStatusFilter("approved")}>Approved</Button>
              <Button size="sm" variant={statusFilter === "pending" ? "default" : "outline"} onClick={() => setStatusFilter("pending")}>Pending</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Visibility:</span>
              <Button size="sm" variant={visibilityFilter === "all" ? "default" : "outline"} onClick={() => setVisibilityFilter("all")}>All</Button>
              <Button size="sm" variant={visibilityFilter === "PUBLIC" ? "default" : "outline"} onClick={() => setVisibilityFilter("PUBLIC")}>Public</Button>
              <Button size="sm" variant={visibilityFilter === "PRIVATE" ? "default" : "outline"} onClick={() => setVisibilityFilter("PRIVATE")}>Private</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid place-content-center py-20">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-sm text-red-600">Failed to load achievements.</div>
          ) : data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data as any[])
                    .filter((a: any) => {
                      if (statusFilter === "approved" && !a.isApproved) return false;
                      if (statusFilter === "pending" && a.isApproved) return false;
                      if (visibilityFilter !== "all" && a.visibility !== visibilityFilter) return false;
                      return true;
                    })
                    .map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell>{a.category || "-"}</TableCell>
                      <TableCell>{a.date ? new Date(a.date).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.visibility}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{a.user?.name || "Unknown"}</div>
                          <div className="text-muted-foreground text-xs">{a.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {a.isApproved ? (
                          <span className="text-green-600 flex items-center gap-1 text-sm"><CheckCircle className="size-4" /> Approved</span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1 text-sm"><XCircle className="size-4" /> Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {a.fileUrl && (
                          <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 underline">
                            <ExternalLink className="size-3" /> File
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(a.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(a.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete achievement "${a.title}"? This cannot be undone.`)) {
                              deleteMutation.mutate(a.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No achievements found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}