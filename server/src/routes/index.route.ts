import { Router } from "express";
import achievementRoute from "./v1/achievement.route";
import authRouter from "./v1/auth.route";
import homeFeed from "./v1/home.route";
import publicationRouter from "./v1/publication.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/achievement", achievementRoute);
router.use("/publication", publicationRouter);
router.use("/feed", homeFeed);

export default router;
