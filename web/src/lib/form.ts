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
  description?: string | null;
  fields: FormField[];
  slug: string;
  createdById: string;
  category?: string;
  isOpen?: boolean;
}

export const createForm = async (data: {
  title: string;
  description?: string;
  fields: FormField[];
  category?: string;
}) => {
  const res = await api.post("/forms", data);
  return res.data as Form;
};

export const getForm = async (slug: string) => {
  const res = await api.get(`/forms/${slug}`);
  return res.data as Form & { hasSubmitted?: boolean };
};

export const submitForm = async (slug: string, data: Record<string, any>) => {
  const res = await api.post(`/forms/${slug}/submit`, { data });
  return res.data;
};

export const listForms = async () => {
  const res = await api.get("/forms");
  return res.data as Array<{
    id: string;
    title: string;
    description?: string;
    slug: string;
    category: string;
    isOpen: boolean;
    createdAt: string;
    createdBy?: { id: string; name: string; email: string; role: string };
    _count?: { submissions: number };
  }>;
};

export const listMyForms = async () => {
  const res = await api.get("/forms/mine");
  return res.data as Array<{
    id: string;
    title: string;
    description?: string;
    slug: string;
    category: string;
    isOpen: boolean;
    createdAt: string;
    _count?: { submissions: number };
  }>;
};

export const getFormSubmissions = async (slug: string) => {
  const res = await api.get(`/forms/${slug}/submissions`);
  return res.data as {
    form: { id: string; title: string; slug: string };
    submissions: Array<{
      id: string;
      createdAt: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        stdId?: string | null;
        department: string;
      };
      answers: Array<{ id: string; value: any; field: FormField }>;
    }>;
  };
};

export const listMySubmissions = async () => {
  const res = await api.get("/forms/submissions/mine");
  return res.data as Array<{
    id: string;
    createdAt: string;
    form: { id: string; title: string; slug: string; category: string };
    answers: Array<{ id: string; value: any; field: FormField }>;
  }>;
};

export const updateFormApi = async (
  id: string,
  data: Partial<{
    title: string;
    description?: string;
    isOpen: boolean;
    category: string;
    fields: FormField[];
  }>,
) => {
  const res = await api.patch(`/forms/${id}`, data);
  return res.data;
};

export const deleteFormApi = async (id: string) => {
  const res = await api.delete(`/forms/${id}`);
  return res.data;
};
