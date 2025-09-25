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
import { createAchievement } from "@/lib/achievement";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

const CreateAchievementPage = () => {
  const router = useRouter();

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createAchievement(formData),
    onSuccess: () => {
      toast.success("Achievement created!");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      addForm.reset();
      router.push("/app/achievements");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || err.message),
  });

  const addForm = useForm<AchievementForm>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      visibility: "PUBLIC",
    },
  });

  const onAddSubmit = (values: AchievementForm) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "file" && value) formData.append(key, value);
      else formData.append(key, value as string);
    });
    createMutation.mutate(formData);
  };
  return (
    <div>
      <Form {...addForm}>
        <form
          onSubmit={addForm.handleSubmit(onAddSubmit)}
          className="mt-2 space-y-4"
        >
          {/* Title */}
          <FormField
            control={addForm.control}
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
            control={addForm.control}
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
            control={addForm.control}
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
            control={addForm.control}
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
            control={addForm.control}
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
            control={addForm.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-gray-500"
                  onClick={() => document.getElementById("addFile")?.click()}
                >
                  {field.value ? (
                    <span>{field.value.name}</span>
                  ) : (
                    "Drag & Drop or click to upload"
                  )}
                  <Input
                    type="file"
                    id="addFile"
                    className="hidden"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateAchievementPage;
