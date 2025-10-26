import { Router } from "express";
import achievementRoute from "./v1/achievement.route";
import adminRouter from "./v1/admin.route";
import authRouter from "./v1/auth.route";
import homeFeed from "./v1/home.route";
import publicationRouter from "./v1/publication.route";
import formRouter from "./v1/form.route";
import cvRouter from "./v1/cv.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/achievement", achievementRoute);
router.use("/publication", publicationRouter);
router.use("/feed", homeFeed);
router.use("/admin", adminRouter);
router.use("/forms", formRouter);
router.use("/cv", cvRouter);

export default router;
