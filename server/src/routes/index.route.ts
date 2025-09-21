import { Router } from "express";
import achievementRoute from "./v1/achievement.route";
import authRouter from "./v1/auth.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/achievement", achievementRoute);

export default router;
