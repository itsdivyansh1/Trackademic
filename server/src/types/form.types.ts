import { z } from "zod";

export const FieldTypeEnum = z.enum([
  "TEXT",
  "NUMBER",
  "TEXTAREA",
  "EMAIL",
  "SELECT",
  "RADIO",
  "CHECKBOX",
  "DATE",
]);

export const FormCategoryEnum = z.enum([
  "ACHIEVEMENT",
  "CERTIFICATION",
  "GENERIC",
]);

export const FormFieldSchema = z.object({
  id: z.string().uuid().optional(), // client may provide temp ids
  label: z.string().min(1),
  type: FieldTypeEnum,
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const CreateFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: FormCategoryEnum.optional().default("GENERIC"),
  fields: z.array(FormFieldSchema).min(1),
});

export const UpdateFormSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  category: FormCategoryEnum.optional(),
  isOpen: z.boolean().optional(),
  fields: z.array(FormFieldSchema).optional(), // full replace for simplicity
});

export const SubmitFormSchema = z.object({
  data: z.record(z.string(), z.any()),
});

export type CreateFormInput = z.infer<typeof CreateFormSchema>;
export type UpdateFormInput = z.infer<typeof UpdateFormSchema>;
export type SubmitFormInput = z.infer<typeof SubmitFormSchema>;