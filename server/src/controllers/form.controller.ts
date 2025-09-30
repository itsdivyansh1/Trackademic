import { Request, Response } from "express";
import { prisma } from "../config/db.conf";
import { CreateFormSchema, SubmitFormSchema, UpdateFormSchema } from "../types/form.types";
import { customAlphabet } from "nanoid";
import { Prisma } from "@prisma/client";

const nano = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + `-${nano()}`;

export const createForm = async (req: Request, res: Response) => {
  try {
    const parsed = CreateFormSchema.parse(req.body);
    const user = req.user as any;

    const slug = slugify(parsed.title);

    const form = await prisma.form.create({
      data: {
        title: parsed.title,
        description: parsed.description ?? null,
        category: (parsed.category as any) ?? "GENERIC",
        slug,
        createdBy: { connect: { id: user.id as string } },
        fields: {
          create: parsed.fields.map((f) => ({
            label: f.label,
            type: f.type as any,
            required: !!f.required,
            options: f.options ? (f.options as any) : undefined,
          })),
        },
      },
      include: { fields: true },
    });

    res.status(201).json(form);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listForms = async (req: Request, res: Response) => {
  try {
    const role = (req.user as any)?.role;
    const where = role === "FACULTY" || role === "ADMIN" ? {} : { isOpen: true };
    const forms = await prisma.form.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        category: true,
        isOpen: true,
        createdAt: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(forms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFormBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const me = req.user as any;
    const form = await prisma.form.findUnique({
      where: { slug },
      include: { fields: true },
    });
    if (!form) return res.status(404).json({ error: "Form not found" });

    let hasSubmitted = false;
    if (me?.id) {
      const count = await prisma.formSubmission.count({
        where: { formId: form.id, userId: me.id },
      });
      hasSubmitted = count > 0;
    }

    res.json({ ...form, hasSubmitted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string }; // form id
    const parsed = UpdateFormSchema.parse(req.body);
    const me = req.user as any;

    const existing = await prisma.form.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Form not found" });

    if (me.role !== "ADMIN" && existing.createdById !== me.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Update basic fields
    const updateData: Prisma.FormUpdateInput = {};
    if (parsed.title !== undefined) updateData.title = parsed.title;
    if (parsed.description !== undefined) updateData.description = parsed.description;
    if ((parsed as any).category !== undefined) updateData.category = parsed.category as any;
    if (parsed.isOpen !== undefined) updateData.isOpen = parsed.isOpen;

    await prisma.form.update({
      where: { id },
      data: updateData,
    });

    // If fields provided, replace all fields
    if (parsed.fields) {
      await prisma.formField.deleteMany({ where: { formId: id } });
      await prisma.formField.createMany({
        data: parsed.fields.map((f) => ({
          formId: id,
          label: f.label,
          type: f.type as any,
          required: !!f.required,
          options: f.options ? (f.options as any) : undefined,
        })),
      });
    }

    const result = await prisma.form.findUnique({ where: { id }, include: { fields: true } });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const me = req.user as any;

    const existing = await prisma.form.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Form not found" });
    if (me.role !== "ADMIN" && existing.createdById !== me.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const submissions = await prisma.formSubmission.findMany({ where: { formId: id }, select: { id: true } });
    const submissionIds = submissions.map((s) => s.id);

    if (submissionIds.length) {
      await prisma.submissionAnswer.deleteMany({ where: { submissionId: { in: submissionIds } } });
      await prisma.formSubmission.deleteMany({ where: { id: { in: submissionIds } } });
    }

    await prisma.formField.deleteMany({ where: { formId: id } });
    await prisma.form.delete({ where: { id } });

    res.json({ message: "Form deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const parsed = SubmitFormSchema.parse(req.body);
    const me = req.user as any;

    const form = await prisma.form.findUnique({ where: { slug }, include: { fields: true } });
    if (!form) return res.status(404).json({ error: "Form not found" });
    if (!form.isOpen) return res.status(400).json({ error: "Form is closed" });

    // Prevent duplicate submission
    const already = await prisma.formSubmission.findFirst({ where: { formId: form.id, userId: me.id } });
    if (already) return res.status(400).json({ error: "You have already submitted this form" });

    // Validate required fields present
    for (const fld of form.fields) {
      if (fld.required && !(fld.id in parsed.data)) {
        return res.status(400).json({ error: `Missing required field: ${fld.label}` });
      }
    }

    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        userId: me.id,
        answers: {
          create: Object.entries(parsed.data).map(([fieldId, value]) => ({
            fieldId,
            value: value as any,
          })),
        },
      },
      include: { answers: true },
    });

    res.status(201).json({ message: "Submitted", submissionId: submission.id });
  } catch (err: any) {
    // Unique constraint handler
    if (err?.code === "P2002") {
      return res.status(400).json({ error: "You have already submitted this form" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const listSubmissionsForForm = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form) return res.status(404).json({ error: "Form not found" });

    const submissions = await prisma.formSubmission.findMany({
      where: { formId: form.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, stdId: true, department: true } },
        answers: { include: { field: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ form: { id: form.id, title: form.title, slug: form.slug }, submissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listMyForms = async (req: Request, res: Response) => {
  try {
    const me = req.user as any;
    const forms = await prisma.form.findMany({
      where: { createdById: me.id },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        category: true,
        isOpen: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(forms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listMySubmissions = async (req: Request, res: Response) => {
  try {
    const me = req.user as any;
    const subs = await prisma.formSubmission.findMany({
      where: { userId: me.id },
      include: {
        form: { select: { id: true, title: true, slug: true, category: true } },
        answers: { include: { field: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(subs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};