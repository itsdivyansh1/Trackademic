"use client";

import { Button } from "@/components/ui/button";
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
import { FormField, getForm, submitForm } from "@/lib/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const formSchema = z.object({
  data: z.record(z.string(), z.any()),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug; // narrow to string
  const [form, setForm] = useState<null | {
    title: string;
    description?: string;
    fields: FormField[];
    hasSubmitted?: boolean;
  }>(null);
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { data: {} },
  });

  useEffect(() => {
    if (!slug) return;
    getForm(slug)
      .then((f) => setForm(f))
      .catch(console.error);
  }, [slug]);

  if (!form) return <p>Loading form...</p>;

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (form?.hasSubmitted) return;
    submitForm(slug!, values.data)
      .then(() => {
        toast.success("Form submitted!");
        setForm((prev) => (prev ? { ...prev, hasSubmitted: true } : prev));
      })
      .catch((e) => toast.error(e?.response?.data?.error ?? "Submission failed"));
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold">{form.title}</h1>
      <p className="mb-4 text-gray-600">{form.description}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {form.fields.map((field) => (
          <div key={field.id}>
            <label className="mb-1 block font-medium">
              {field.label}
              {field.required && "*"}
            </label>

            <Controller
              control={control}
              name={`data.${field.id}`}
              defaultValue={field.type === "CHECKBOX" ? [] : ""}
              render={({ field: f }) => {
                const disabled = !!form?.hasSubmitted;
                switch (field.type) {
                  case "TEXT":
                  case "EMAIL":
                  case "NUMBER":
                    return (
                      <Input
                        {...f}
                        type={field.type.toLowerCase()}
                        required={field.required}
                        disabled={disabled}
                      />
                    );
                  case "TEXTAREA":
                    return <Textarea {...f} required={field.required} disabled={disabled} />;
                  case "DATE":
                    return (
                      <Input {...f} type="date" required={field.required} disabled={disabled} />
                    );
                  case "SELECT":
                    return (
                      <Select value={f.value} onValueChange={f.onChange} disabled={disabled}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  case "CHECKBOX": {
                    const current: string[] = Array.isArray(f.value) ? f.value : [];
                    return (
                      <div className="space-y-2">
                        {field.options?.map((o) => {
                          const checked = current.includes(o);
                          return (
                            <label key={o} className="flex items-center gap-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) => {
                                  if (disabled) return;
                                  if (c) f.onChange([...current, o]);
                                  else f.onChange(current.filter((v) => v !== o));
                                }}
                                disabled={disabled}
                              />
                              <span>{o}</span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  }
                  case "RADIO": {
                    return (
                      <div className="space-y-2">
                        {field.options?.map((o) => (
                          <label key={o} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={f.name}
                              value={o}
                              checked={f.value === o}
                              onChange={() => f.onChange(o)}
                              disabled={disabled}
                            />
                            <span>{o}</span>
                          </label>
                        ))}
                      </div>
                    );
                  }
                  default:
                    return <></>; // empty fragment instead of null
                }
              }}
            />
          </div>
        ))}

        {form.hasSubmitted ? (
          <div className="text-sm text-muted-foreground">You have already submitted this form.</div>
        ) : (
          <Button type="submit">Submit</Button>
        )}
      </form>

      <div className="mt-6">
        <p>Share this form:</p>
        <input
          type="text"
          readOnly
          value={typeof window !== "undefined" ? window.location.href : ""}
          className="w-full border p-2"
        />
      </div>
    </div>
  );
}
