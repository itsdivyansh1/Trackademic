import { Request, Response, Router } from "express";
import { login, logout, register } from "../../controllers/auth.controller";
import { isAuthenticated } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", isAuthenticated, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
