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
import { deleteAchievement, getUserAchievements } from "@/lib/achievement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditIcon, FileTextIcon, Loader, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
}

const AchievementsPage = () => {
  const queryClient = useQueryClient();
  // TODO:
  // User should be able to create achievements
  // User should be able to edit achievements
  // User should be able to delete achievements
  const { data: achievements, isLoading } = useQuery<Achievement[], Error>({
    queryKey: ["achievements"],
    queryFn: getUserAchievements,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: () => {
      toast.success("Achievement deleted!");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || err.message),
  });

  return (
    <div>
      {/* User creating achievements */}
      {/* Should i redirect user to new page for creating achievement? */}

      <h1>Create achievement</h1>
      <Button asChild>
        <Link href={"/app/achievements/create"}>Create Achievement</Link>
      </Button>

      <div>
        <h2>All the achievements</h2>
        {/* Fetching all the achievements */}
        {/* Achievements List */}
        {isLoading ? (
          <div className="mt-10 flex justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {achievements?.map((ach) => (
              <div
                key={ach.id}
                className="flex flex-col gap-3 rounded-xl border p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{ach.title}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/achievements/edit/${ach.id}`}>
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
                          <AlertDialogTitle>
                            Delete Achievement
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this achievement?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(ach.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  {ach.description}
                </p>
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span className="rounded-full bg-gray-200 px-2 py-1">
                    {ach.category}
                  </span>
                  <span className="text-gray-500">
                    {new Date(ach.date).toLocaleDateString()}
                  </span>
                </div>
                {ach.fileUrl && (
                  <a
                    href={ach.fileUrl}
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
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
