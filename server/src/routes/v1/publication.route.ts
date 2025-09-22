import { Router } from "express";
import {
  approve,
  create,
  listAllAdmin,
  listAllUserPublications,
  listPublicPublications,
  listUserPublications,
  remove,
  update,
} from "../../controllers/publication.controller";
import { isAdmin, isAuthenticated } from "../../middlewares/auth.middleware";
import { uploadFile } from "../../middlewares/upload.middleware";

const router = Router();

// User routes
router.post("/", isAuthenticated, uploadFile.single("file"), create);
router.get("/my", isAuthenticated, listAllUserPublications);
router.get("/user", isAuthenticated, listUserPublications);
router.get("/public", listPublicPublications);
router.put("/:id", isAuthenticated, update);
router.delete("/:id", isAuthenticated, remove);

// Admin routes
router.put("/approve/:id", isAuthenticated, isAdmin, approve);
router.get("/admin/all", isAuthenticated, isAdmin, listAllAdmin);

export default router;
