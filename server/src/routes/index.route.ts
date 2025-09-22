import { Router } from "express";
import achievementRoute from "./v1/achievement.route";
import authRouter from "./v1/auth.route";
import publicationRouter from "./v1/publication.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/achievement", achievementRoute);
router.use("/publication", publicationRouter);

export default router;
