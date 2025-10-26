"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, ExternalLink, Loader } from "lucide-react";

function renderAuthors(a: any): string {
  if (Array.isArray(a)) return a.join(", ");
  if (typeof a === "string") {
    try {
      const parsed = JSON.parse(a);
      if (Array.isArray(parsed)) return parsed.join(", ");
      if (parsed && typeof parsed === "object") return Object.values(parsed).map(String).join(", ");
      // fallback: comma separated
      return a;
    } catch {
      return a;
    }
  }
  if (a && typeof a === "object") return Object.values(a).map(String).join(", ");
  return "";
}

export default function AdminPublicationsPage() {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<"all" | "approved" | "pending">("all");
  const [visibilityFilter, setVisibilityFilter] = React.useState<"all" | "PUBLIC" | "PRIVATE">("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-publications"],
    queryFn: async () => {
      const res = await api.get("/admin/publications");
      return res.data as any[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/publications/${id}/approve`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-publications"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/publications/${id}/reject`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-publications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/publications/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-publications"] }),
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Publications</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Publications</CardTitle>
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
            <div className="text-sm text-red-600">Failed to load publications.</div>
          ) : data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Authors</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data as any[])
                    .filter((p: any) => {
                      if (statusFilter === "approved" && !p.isApproved) return false;
                      if (statusFilter === "pending" && p.isApproved) return false;
                      if (visibilityFilter !== "all" && p.visibility !== visibilityFilter) return false;
                      return true;
                    })
                    .map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell className="truncate max-w-[260px]">{renderAuthors(p.authors)}</TableCell>
                      <TableCell>{p.journalConference || "-"}</TableCell>
                      <TableCell>{p.publicationYear || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.visibility}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{p.user?.name || "Unknown"}</div>
                          <div className="text-muted-foreground text-xs">{p.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.isApproved ? (
                          <span className="text-green-600 flex items-center gap-1 text-sm"><CheckCircle className="size-4" /> Approved</span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1 text-sm"><XCircle className="size-4" /> Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {p.fileUrl && (
                          <a 
                            href={p.fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs inline-flex items-center gap-1 underline"
                          >
                            <ExternalLink className="size-3" /> File
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(p.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(p.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete publication "${p.title}"? This cannot be undone.`)) {
                              deleteMutation.mutate(p.id);
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
            <div className="text-sm text-muted-foreground">No publications found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}