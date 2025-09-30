import { Router } from "express";
import {
  approveAchievement,
  approvePublication,
  approveUser,
  deleteUser,
  getAllAchievements,
  getAllPublications,
  getAllUsers,
  getUserStats,
  rejectAchievement,
  rejectPublication,
  toggleUserApproval,
  updateUserRole,
  deleteAchievementAdmin,
  deletePublicationAdmin,
} from "../../controllers/admin.controller";
import { isAdmin, isAuthenticated } from "../../middlewares/auth.middleware";

const router = Router();

router.use(isAuthenticated, isAdmin);

// Users
router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats); // New endpoint for statistics
router.patch("/users/:id/approve", approveUser); // legacy approve-only
router.patch("/users/:id/toggle-approval", toggleUserApproval); // toggle approve/reject
router.patch("/users/:id/role", updateUserRole); // update user role
router.delete("/users/:id", deleteUser);

// Achievements
router.get("/achievements", getAllAchievements);
router.patch("/achievements/:id/approve", approveAchievement);
router.patch("/achievements/:id/reject", rejectAchievement);
router.delete("/achievements/:id", deleteAchievementAdmin);

// Publications
router.get("/publications", getAllPublications);
router.patch("/publications/:id/approve", approvePublication);
router.patch("/publications/:id/reject", rejectPublication);
router.delete("/publications/:id", deletePublicationAdmin);

export default router;
