"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

import { createForm, Form, FormField } from "@/lib/form";

// Zod schema for validation
const formBuilderSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, "Field label is required"),
      type: z.enum([
        "TEXT",
        "NUMBER",
        "TEXTAREA",
        "EMAIL",
        "SELECT",
        "RADIO",
        "CHECKBOX",
        "DATE",
      ]),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    }),
  ),
});

type FormBuilderValues = z.infer<typeof formBuilderSchema>;

export default function ModernFormBuilder() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: { title: "", description: "", fields: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

  // Mutation to create form
  const createFormMutation = useMutation({
    mutationFn: (data: FormBuilderValues) => createForm(data),
    onSuccess: (form: Form) =>
      router.push(`/app/form-builder/forms/${form.slug}`),
  });

  // Add field helper
  const addField = (type: FormField["type"] = "TEXT") => {
    append({
      id: crypto.randomUUID(),
      label: "",
      type,
      required: false,
      options: [],
    });
  };

  const onSubmit: SubmitHandler<FormBuilderValues> = (data) => {
    createFormMutation.mutate(data);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        {/* Builder */}
        <div className="flex-1 space-y-6">
          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle>Form Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input {...field} placeholder="Form Title" />
                )}
              />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}

              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea {...field} placeholder="Form Description" />
                )}
              />

              {fields.map((field, index) => (
                <Card key={field.id} className="rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Controller
                        control={control}
                        name={`fields.${index}.label`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Field Label" />
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <Select
                          value={watch(`fields.${index}.type`)}
                          onValueChange={(v) =>
                            setValue(
                              `fields.${index}.type`,
                              v as FormField["type"],
                            )
                          }
                        >
                          <SelectTrigger className="min-w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "TEXT",
                              "NUMBER",
                              "TEXTAREA",
                              "EMAIL",
                              "SELECT",
                              "RADIO",
                              "CHECKBOX",
                              "DATE",
                            ].map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Controller
                          control={control}
                          name={`fields.${index}.required`}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            >
                              Required
                            </Checkbox>
                          )}
                        />
                      </div>
                      {["SELECT", "RADIO", "CHECKBOX"].includes(
                        watch(`fields.${index}.type`),
                      ) && (
                        <Controller
                          control={control}
                          name={`fields.${index}.options`}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              placeholder="Options (comma separated)"
                              value={field.value?.join(",") || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .split(",")
                                    .map((o) => o.trim()),
                                )
                              }
                            />
                          )}
                        />
                      )}
                    </div>
                    <Button variant="ghost" onClick={() => remove(index)}>
                      <Trash2 />
                    </Button>
                  </div>
                </Card>
              ))}

              <div className="flex flex-wrap gap-2">
                {[
                  "TEXT",
                  "NUMBER",
                  "TEXTAREA",
                  "EMAIL",
                  "SELECT",
                  "RADIO",
                  "CHECKBOX",
                  "DATE",
                ].map((t) => (
                  <Button
                    key={t}
                    onClick={() => addField(t as FormField["type"])}
                  >
                    Add {t}
                  </Button>
                ))}
              </div>

              <Button className="mt-4 w-full" onClick={handleSubmit(onSubmit)}>
                Create Form
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="flex-1">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <h2 className="text-lg font-bold">{watch("title")}</h2>
                <p className="text-muted-foreground">{watch("description")}</p>

                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <label className="block font-medium">
                      {watch(`fields.${index}.label`)}{" "}
                      {watch(`fields.${index}.required`) && "*"}
                    </label>
                    {watch(`fields.${index}.type`) === "TEXT" && <Input />}
                    {watch(`fields.${index}.type`) === "NUMBER" && (
                      <Input type="number" />
                    )}
                    {watch(`fields.${index}.type`) === "TEXTAREA" && (
                      <Textarea />
                    )}
                    {watch(`fields.${index}.type`) === "EMAIL" && (
                      <Input type="email" />
                    )}
                    {watch(`fields.${index}.type`) === "DATE" && (
                      <Input type="date" />
                    )}
                  </div>
                ))}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
