import { Router } from "express";
import {
  approve,
  create,
  listAllAchievements,
  listPublicAchievements,
  remove,
  update,
} from "../../controllers/achievement.controller";
import { isAdmin, isAuthenticated } from "../../middlewares/auth.middleware";
import { uploadAchievement } from "../../middlewares/upload.middleware";

const router = Router();

// TODO:
// - First check if the user is authenticated or not || Using authMiddleware
// - User should be only able to perform actions on his achievements
// 1. User should be able to create their ahievement
//    - Setting up db for storing the data
//    - Setting up S3 where all the files will be uploaded
// 2. User should be able to edit their achievement
// 3. User should be able to delete their achievement
// 4. User should be able to view their achievment

// router.get("/public", isAuthenticated, listPublicAchievements);
// router.get("/my", isAuthenticated, listAllAchievements);

// router.post("/create", isAuthenticated, uploadFile.single("file"), create);

// CREATE achievement with file upload
router.post("/", isAuthenticated, uploadAchievement.single("file"), create);

// LIST public achievements (no auth needed)
router.get("/public", listPublicAchievements);

// LIST all achievements for logged-in user (public + private)
router.get("/my", isAuthenticated, listAllAchievements);

// UPDATE achievement by ID
router.put("/:id", isAuthenticated, uploadAchievement.single("file"), update);

// DELETE achievement by ID
router.delete("/:id", isAuthenticated, remove);

// APPROVE ACHIEVEMENT BY ADMIN ONLY
router.put("/approve/:id", isAuthenticated, isAdmin, approve);

export default router;
