import { Request, Response, Router } from "express";
import { login, logout, register } from "../../controllers/auth.controller";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { uploadProfile } from "../../middlewares/upload.middleware";

const router = Router();

// Accept multipart form-data with optional profile image
router.post("/register", uploadProfile.single("profileImage"), register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", isAuthenticated, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
