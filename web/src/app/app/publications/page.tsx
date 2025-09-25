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
import { Button } from "@/components/ui/button";
import {
  deletePublication,
  getUserPublications,
  Publication,
} from "@/lib/publication";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const PublicationsPage = () => {
  const queryClient = useQueryClient();

  const { data: publications, isLoading } = useQuery<Publication[], Error>({
    queryKey: ["publications"],
    queryFn: getUserPublications,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePublication(id),
    onSuccess: () => {
      toast.success("Publication deleted!");
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || err.message),
  });

  if (isLoading) {
    return <p>Loading publications...</p>;
  }

  return (
    <div>
      <h1>My Publications</h1>
      <Button asChild>
        <Link href={"/app/publications/create"}>Create Publication</Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {publications?.map((pub) => (
          <div
            key={pub.id}
            className="flex flex-col gap-3 rounded-xl border p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{pub.title}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/app/publications/edit/${pub.id}`}>
                    <EditIcon className="size-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2Icon className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Publication</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this publication? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(pub.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Abstract (mapped as description) */}
            <p className="text-muted-foreground text-sm">{pub.abstract}</p>

            {/* Metadata */}
            <div className="text-muted-foreground flex flex-col gap-1 text-xs">
              <span className="text-gray-500">
                {(pub.publishedAt || pub.createdAt) &&
                  new Date(
                    pub.publishedAt || pub.createdAt!,
                  ).toLocaleDateString()}
              </span>

              {pub.doi && (
                <span className="text-blue-600">
                  <strong>DOI:</strong>{" "}
                  <a
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {pub.doi}
                  </a>
                </span>
              )}

              {pub.journalConference && (
                <span>
                  <strong>Journal:</strong> {pub.journalConference}
                </span>
              )}

              {pub.authors && (
                <span>
                  <strong>Authors:</strong> {pub.authors}
                </span>
              )}

              {pub.publicationYear && (
                <span>
                  <strong>Year:</strong> {pub.publicationYear}
                </span>
              )}
            </div>

            {/* File Link */}
            {pub.fileUrl && (
              <a
                href={pub.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 text-blue-500 underline"
              >
                <FileTextIcon className="size-4" /> View File
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicationsPage;
