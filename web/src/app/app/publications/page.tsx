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
  deletePublication,
  getUserPublications,
  updatePublication,
  type Publication,
} from "@/lib/publication";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
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

function renderAuthors(a: any): string {
  if (Array.isArray(a)) return a.join(", ");
  if (typeof a === "string") {
    try {
      const parsed = JSON.parse(a);
      if (Array.isArray(parsed)) return parsed.join(", ");
      if (parsed && typeof parsed === "object")
        return Object.values(parsed).map(String).join(", ");
      return a;
    } catch {
      return a;
    }
  }
  if (a && typeof a === "object")
    return Object.values(a).map(String).join(", ");
  return "";
}

// ✅ Approval badge renderer
function getApprovalBadge(isApproved?: boolean) {
  if (isApproved === true) {
    return (
      <Badge className="flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <CheckCircle className="size-3" />
        Approved
      </Badge>
    );
  }
  if (isApproved === false) {
    return (
      <Badge className="flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400">
        <Clock className="size-3" />
        Pending
      </Badge>
    );
  }
  return null;
}

export default function PublicationsPage() {
  const { data: userPublications, isLoading } = useQuery({
    queryKey: ["publications"],
    queryFn: getUserPublications,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();

  const publications = userPublications || [];

  const deleteMutation = useMutation({
    mutationFn: deletePublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast.success("Publication deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete publication.");
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
      return updatePublication(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast.success("Publication visibility updated!");
    },
    onError: () => {
      toast.error("Failed to update visibility.");
    },
  });

  const filteredPublications = publications.filter((publication: any) => {
    if (
      searchQuery &&
      !publication.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading publications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>
          <p className="text-muted-foreground">
            Manage your research publications and track their impact
          </p>
        </div>
        <Button asChild>
          <Link href="/app/publications/create">
            <Plus className="mr-2 size-4" />
            Add Publication
          </Link>
        </Button>
      </div>

      {/* Publications List */}
      {filteredPublications.length > 0 ? (
        <div className="space-y-4">
          {filteredPublications.map((publication: Publication) => (
            <Card
              key={publication.id}
              className="transition-shadow hover:shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <BookOpen className="size-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="mb-2 cursor-pointer text-lg font-semibold hover:underline"
                        onClick={() => {
                          const params = new URLSearchParams({
                            type: "publication",
                            id: publication.id,
                            title: publication.title,
                            ...(publication.fileUrl
                              ? { fileUrl: publication.fileUrl }
                              : {}),
                          });
                          window.open(`/app/viewer?${params.toString()}`);
                        }}
                      >
                        {publication.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                        {publication.abstract &&
                        publication.abstract.length > 150
                          ? `${publication.abstract.substring(0, 150)}...`
                          : publication.abstract}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Authors:</span>
                          <span>{renderAuthors(publication.authors)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Year:</span>
                          <span>{publication.publicationYear}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {publication.visibility === "PUBLIC" ? (
                            <Globe className="size-4 text-green-600" />
                          ) : (
                            <Lock className="size-4 text-gray-500" />
                          )}
                          <span
                            className={
                              publication.visibility === "PUBLIC"
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            {publication.visibility}
                          </span>
                        </div>

                        {/* ✅ Approval badge */}
                        {getApprovalBadge(publication.isApproved)}

                        {publication.journalConference && (
                          <Badge variant="outline">
                            {publication.journalConference}
                          </Badge>
                        )}
                        {publication.fileUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(publication.fileUrl, "_blank");
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <FileText className="size-4" />
                            <span className="text-sm">View attachment</span>
                          </button>
                        )}
                      </div>
                      {publication.doi && (
                        <div className="mt-2">
                          <a
                            href={`https://doi.org/${publication.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="size-3" />
                            DOI: {publication.doi}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/app/publications/edit/${publication.id}`}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 size-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          toggleVisibilityMutation.mutate({
                            id: publication.id,
                            currentVisibility: publication.visibility,
                          })
                        }
                        disabled={toggleVisibilityMutation.isPending}
                      >
                        {publication.visibility === "PUBLIC" ? (
                          <>
                            <Lock className="mr-2 size-4" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 size-4" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>

                      {publication.fileUrl && (
                        <DropdownMenuItem asChild>
                          <a
                            href={publication.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="mr-2 size-4" />
                            View File
                          </a>
                        </DropdownMenuItem>
                      )}

                      {publication.doi && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`https://doi.org/${publication.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="mr-2 size-4" />
                            View DOI
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
                              Delete Publication
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;
                              {publication.title}&rdquo;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteMutation.mutate(publication.id)
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
        <Card className="p-12 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-4 size-12" />
          <h3 className="mb-2 text-lg font-semibold">No publications yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your academic portfolio by adding your first
            publication
          </p>
          <Button asChild>
            <Link href="/app/publications/create">
              <Plus className="size-4" />
              Add Publication
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
