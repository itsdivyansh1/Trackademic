"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getUserPublications, updatePublication } from "@/lib/publication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

// Schema
const publicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  abstract: z.string().min(1, "Abstract is required"),
  authors: z.string().min(1, "Authors are required"),
  journalConference: z.string().min(1, "Journal / Conference is required"),
  publicationYear: z
    .number()
    .min(1900, "Year must be valid")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  doi: z.string().min(1, "DOI is required"),
  publishedAt: z.string().min(1, "Published date is required"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  file: z.any().optional(),
});

type PublicationForm = z.infer<typeof publicationSchema>;

interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string | string[];
  journalConference: string;
  publicationYear: number;
  doi: string;
  publishedAt: string;
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
}

export default function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [currentPublication, setCurrentPublication] =
    useState<Publication | null>(null);

  const router = useRouter();
  const { id } = use(params);

  const queryClient = useQueryClient();
  const { data: publications, isLoading } = useQuery<Publication[], Error>({
    queryKey: ["publications"],
    queryFn: getUserPublications,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updatePublication(id, formData),
    onSuccess: () => {
      toast.success("Publication updated!");
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      router.push("/app/publications");
    },
    onError: (err: any) => {
      console.error("Update error:", err);
      toast.error(err?.response?.data?.error || err.message);
    },
  });

  const editForm = useForm<PublicationForm>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: "",
      abstract: "",
      authors: "",
      journalConference: "",
      publicationYear: new Date().getFullYear(),
      doi: "",
      publishedAt: "",
      visibility: "PUBLIC",
    },
  });

  // Load selected publication and prefill form
  useEffect(() => {
    if (publications && id) {
      const found = publications.find((p) => p.id === id);
      if (found) {
        setCurrentPublication(found);
        editForm.reset({
          title: found.title,
          abstract: found.abstract,
          authors: Array.isArray(found.authors) ? found.authors.join(", ") : (found.authors || ""),
          journalConference: found.journalConference,
          publicationYear: found.publicationYear,
          doi: found.doi,
          publishedAt: found.publishedAt.split("T")[0], // Format for input date
          visibility: found.visibility,
          file: undefined, // Always start with no new file selected
        });
      }
    }
  }, [publications, id, editForm]);

  const onEditSubmit = (values: PublicationForm) => {
    const formData = new FormData();

    // Add all fields except file first
    Object.entries(values).forEach(([key, value]) => {
      if (key === "file") {
        // Only append file if a new file is selected
        if (value && value instanceof File) {
          formData.append(key, value);
        }
        // If no new file is selected, don't append the file field at all
        // This tells the backend to keep the existing file
      } else if (key === "publicationYear") {
        formData.append(key, String(value));
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value as string);
      }
    });

    console.log("Form data entries:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    updateMutation.mutate({ id, formData });
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  if (!currentPublication && publications) {
    return <div className="p-4">Publication not found</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Publication</h1>

      <Form {...editForm}>
        <form
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          className="space-y-6"
        >
          {/* Title */}
          <FormField
            control={editForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Input placeholder="Publication title" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Abstract */}
          <FormField
            control={editForm.control}
            name="abstract"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abstract</FormLabel>
                <Textarea
                  placeholder="Abstract"
                  className="min-h-[120px]"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Authors */}
          <FormField
            control={editForm.control}
            name="authors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authors</FormLabel>
                <Input placeholder="Authors (comma separated)" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Journal / Conference */}
          <FormField
            control={editForm.control}
            name="journalConference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Journal / Conference</FormLabel>
                <Input placeholder="Journal or Conference" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}

          {/* Publication Year */}
          <FormField
            control={editForm.control}
            name="publicationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publication Year</FormLabel>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DOI */}
          <FormField
            control={editForm.control}
            name="doi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DOI</FormLabel>
                <Input placeholder="DOI" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published Date */}
          <FormField
            control={editForm.control}
            name="publishedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Published At</FormLabel>
                <Input type="date" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visibility */}
          <FormField
            control={editForm.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  value={field.value || "PUBLIC"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Enhanced File Upload */}
          <FormField
            control={editForm.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>

                {/* Show current file info if exists */}
                {currentPublication?.fileUrl && !field.value && (
                  <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-sm font-medium text-blue-700">
                      📄 Current file is attached
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      Leave empty to keep current file, or select a new file to
                      replace it
                    </p>
                  </div>
                )}

                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-gray-500 hover:bg-gray-50"
                  onClick={() =>
                    document.getElementById("editPubFile")?.click()
                  }
                >
                  {field.value ? (
                    <div className="space-y-2">
                      <div className="font-medium text-green-600">
                        ✓ {field.value.name}
                      </div>
                      <p className="text-xs text-green-600">
                        New file selected - will replace current file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-gray-600">
                        📎 Click to select new file (optional)
                      </div>
                      {currentPublication?.fileUrl && (
                        <p className="text-xs text-gray-500">
                          Current file will be kept if no new file is selected
                        </p>
                      )}
                    </div>
                  )}
                  <Input
                    type="file"
                    id="editPubFile"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </div>

                {/* Clear file button if a new file is selected */}
                {field.value && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      field.onChange(undefined);
                      // Reset the file input
                      const fileInput = document.getElementById(
                        "editPubFile",
                      ) as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                    }}
                    className="mt-2"
                  >
                    🗑️ Clear new file selection
                  </Button>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Publication"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/app/publications")}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
