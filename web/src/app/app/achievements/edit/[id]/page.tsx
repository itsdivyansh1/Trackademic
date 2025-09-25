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
import { getUserAchievements, updateAchievement } from "@/lib/achievement";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  file: z.any().optional(),
});

type AchievementForm = z.infer<typeof achievementSchema>;

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
}

export default function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const queryClient = useQueryClient();
  const { data: achievements, isLoading } = useQuery<Achievement[], Error>({
    queryKey: ["achievements"],
    queryFn: getUserAchievements,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateAchievement(id, formData),
    onSuccess: () => {
      toast.success("Achievement updated!");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      router.push("/app/achievements");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || err.message),
  });

  const editForm = useForm<AchievementForm>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      visibility: "PUBLIC",
    },
  });

  // Once achievements load, reset form with the matching achievement
  useEffect(() => {
    if (achievements && id) {
      const found = achievements.find((a) => a.id === id);
      if (found) {
        editForm.reset({
          title: found.title,
          description: found.description,
          category: found.category,
          date: found.date.split("T")[0], // format for <input type="date" />
          visibility: found.visibility,
          file: undefined, // don't auto-fill file input
        });
      }
    }
  }, [achievements, id, editForm]);

  const onEditSubmit = (values: AchievementForm) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "file" && value) formData.append(key, value);
      else formData.append(key, value as string);
    });
    updateMutation.mutate({ id, formData });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <Form {...editForm}>
        <form
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          className="mt-2 space-y-4"
        >
          {/* Title */}
          <FormField
            control={editForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Input placeholder="Achievement title" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Description */}
          <FormField
            control={editForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <Textarea placeholder="Describe your achievement" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Category */}
          <FormField
            control={editForm.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Input
                  placeholder="Category (e.g., Sports, Academic)"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Date */}
          <FormField
            control={editForm.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
          {/* Drag & Drop File */}
          <FormField
            control={editForm.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-gray-500"
                  onClick={() => document.getElementById("editFile")?.click()}
                >
                  {field.value ? (
                    <span>{field.value.name}</span>
                  ) : (
                    "Drag & Drop or click to upload"
                  )}
                  <Input
                    type="file"
                    id="editFile"
                    className="hidden"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
}
