import { Router } from "express";
import {
  createForm,
  deleteForm,
  getFormBySlug,
  listForms,
  listMyForms,
  listMySubmissions,
  listSubmissionsForForm,
  submitForm,
  updateForm,
} from "../../controllers/form.controller";
import { isAuthenticated, isFacultyOrAdmin } from "../../middlewares/auth.middleware";

const router = Router();

// create form (faculty/admin)
router.post("/", isAuthenticated, isFacultyOrAdmin, createForm);

// list forms (students see only open forms)
router.get("/", isAuthenticated, listForms);

// my forms (faculty/admin)
router.get("/mine", isAuthenticated, isFacultyOrAdmin, listMyForms);

// get single form by slug (all authenticated)
router.get("/:slug", isAuthenticated, getFormBySlug);

// update/delete form by id (creator or admin)
router.patch("/:id", isAuthenticated, isFacultyOrAdmin, updateForm);
router.delete("/:id", isAuthenticated, isFacultyOrAdmin, deleteForm);

// submit
router.post("/:slug/submit", isAuthenticated, submitForm);

// submissions for a form (faculty/admin)
router.get("/:slug/submissions", isAuthenticated, isFacultyOrAdmin, listSubmissionsForForm);

// my submissions (any user)
router.get("/submissions/mine", isAuthenticated, listMySubmissions);

export default router;