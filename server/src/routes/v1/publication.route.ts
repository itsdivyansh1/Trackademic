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
import { memoryUpload } from "../../middlewares/upload.middleware";

const router = Router();

// User routes
router.post("/", isAuthenticated, memoryUpload.single("file"), create);
router.put("/:id", isAuthenticated, memoryUpload.single("file"), update);

router.get("/my", isAuthenticated, listAllUserPublications);
router.get("/user", isAuthenticated, listUserPublications);
router.get("/public", listPublicPublications);

router.delete("/:id", isAuthenticated, remove);

// Admin routes
router.put("/approve/:id", isAuthenticated, isAdmin, approve);
router.get("/admin/all", isAuthenticated, isAdmin, listAllAdmin);

export default router;
