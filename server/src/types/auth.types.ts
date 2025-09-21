import z from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  phone: z
    .string()
    .regex(/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Invalid Indian phone number"),
  department: z.string(),
  stdId: z.string().optional(),
  role: z.enum(["STUDENT", "FACULTY"]),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
