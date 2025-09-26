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
  }>(null);
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (!slug) return;
    getForm(slug)
      .then((f) => setForm(f))
      .catch(console.error);
  }, [slug]);

  if (!form) return <p>Loading form...</p>;

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    submitForm(slug!, values.data)
      .then(() => alert("Form submitted!"))
      .catch(console.error);
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
              defaultValue=""
              render={({ field: f }) => {
                switch (field.type) {
                  case "TEXT":
                  case "EMAIL":
                  case "NUMBER":
                    return (
                      <Input
                        {...f}
                        type={field.type.toLowerCase()}
                        required={field.required}
                      />
                    );
                  case "TEXTAREA":
                    return <Textarea {...f} required={field.required} />;
                  case "DATE":
                    return (
                      <Input {...f} type="date" required={field.required} />
                    );
                  case "SELECT":
                    return (
                      <Select {...f}>
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
                  case "CHECKBOX":
                    return (
                      <>
                        {field.options?.map((o) => (
                          <div key={o}>
                            <Checkbox {...f} value={o} />
                            <label>{o}</label>
                          </div>
                        ))}
                      </>
                    );
                  case "RADIO":
                    return (
                      <>
                        {field.options?.map((o) => (
                          <div key={o}>
                            <input type="radio" {...f} value={o} id={o} />
                            <label htmlFor={o}>{o}</label>
                          </div>
                        ))}
                      </>
                    );
                  default:
                    return <></>; // empty fragment instead of null
                }
              }}
            />
          </div>
        ))}

        <Button type="submit">Submit</Button>
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
