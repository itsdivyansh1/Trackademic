import { api } from "./api";

// Define strict field types
export type FieldType =
  | "TEXT"
  | "NUMBER"
  | "TEXTAREA"
  | "EMAIL"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "DATE";

export interface FormField {
  id: string;
  label: string;
  type: FieldType; // Use union type instead of string
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  slug: string;
  createdById: string;
}

export const createForm = async (data: {
  title: string;
  description?: string;
  fields: FormField[];
}) => {
  const res = await api.post("/forms", data);
  return res.data as Form;
};

export const getForm = async (slug: string) => {
  const res = await api.get(`/forms/${slug}`);
  return res.data as Form;
};

export const submitForm = async (slug: string, data: Record<string, any>) => {
  const res = await api.post(`/forms/${slug}/submit`, { data });
  return res.data;
};
