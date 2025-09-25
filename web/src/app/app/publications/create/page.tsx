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
import { createPublication } from "@/lib/publication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

// Zod schema
const publicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  abstract: z.string().min(1, "Abstract is required"),
  authors: z.string().min(1, "Authors are required"),
  journalConference: z.string().min(1, "Journal / Conference is required"),
  category: z.string().min(1, "Category is required"),
  publicationYear: z
    .number()
    .refine((val) => !isNaN(val), {
      message: "Publication year must be a number",
    })
    .min(1900, "Year must be valid")
    .max(new Date().getFullYear(), "Year cannot be in the future"),

  doi: z.string().min(1, "DOI is required"),
  publishedAt: z.string().min(1, "Published date is required"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  file: z.any().optional(),
});

type PublicationForm = z.infer<typeof publicationSchema>;

const CreatePublicationPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createPublication(formData),
    onSuccess: () => {
      toast.success("Publication created!");
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      addForm.reset();
      router.push("/app/publications");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || err.message),
  });

  const addForm = useForm<PublicationForm>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: "",
      abstract: "",
      authors: "",
      journalConference: "",
      category: "",
      publicationYear: new Date().getFullYear(),
      doi: "",
      publishedAt: "",
      visibility: "PUBLIC",
    },
  });

  const onAddSubmit = (values: PublicationForm) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "file" && value) {
        formData.append(key, value);
      } else if (key === "publicationYear") {
        // Convert to string for FormData
        formData.append(key, String(value));
      } else {
        formData.append(key, value as string);
      }
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
                <Input placeholder="Publication title" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Abstract */}
          <FormField
            control={addForm.control}
            name="abstract"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abstract</FormLabel>
                <Textarea placeholder="Abstract / Description" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Authors */}
          <FormField
            control={addForm.control}
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
            control={addForm.control}
            name="journalConference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Journal / Conference</FormLabel>
                <Input placeholder="Journal or Conference name" {...field} />
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
                  placeholder="Category (e.g., AI, ML, Physics)"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Publication Year */}
          <FormField
            control={addForm.control}
            name="publicationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publication Year</FormLabel>
                <Input
                  type="number"
                  placeholder="2025"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DOI */}
          <FormField
            control={addForm.control}
            name="doi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DOI</FormLabel>
                <Input placeholder="DOI" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published At */}
          <FormField
            control={addForm.control}
            name="publishedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Published Date</FormLabel>
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
                <Select
                  value={field.value || "PUBLIC"} // ensure default
                  onValueChange={(val) => field.onChange(val)}
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

          {/* File Upload */}
          <FormField
            control={addForm.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-gray-500"
                  onClick={() => document.getElementById("pubFile")?.click()}
                >
                  {field.value ? (
                    <span>{field.value.name}</span>
                  ) : (
                    "Drag & Drop or click to upload"
                  )}
                  <Input
                    type="file"
                    id="pubFile"
                    className="hidden"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Create Publication
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreatePublicationPage;
