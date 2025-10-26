import { Request, Response, Router } from "express";
import { login, logout, register, profile, updateProfile, getS3Config } from "../../controllers/auth.controller";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { uploadProfile } from "../../middlewares/upload.middleware";

const router = Router();

// Accept multipart form-data with optional profile image
router.post("/register", uploadProfile.single("profileImage"), register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", isAuthenticated, profile);
router.put("/profile", isAuthenticated, uploadProfile.single("profileImage"), updateProfile);
router.get("/s3-config", getS3Config);

export default router;
