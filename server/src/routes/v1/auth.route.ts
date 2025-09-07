import { Request, Response, Router } from "express";
import { login, logout, register } from "../../controllers/auth.controller";
import { isAuthenticated } from "../../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

authRouter.get("/profile", isAuthenticated, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default authRouter;
