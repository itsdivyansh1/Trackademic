import { Router } from "express";
import authRouter from "./v1/auth.route";

const router = Router();

router.use("/auth", authRouter);

export default router;
