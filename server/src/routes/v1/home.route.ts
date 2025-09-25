import { Router } from "express";
import { getHomeFeed } from "../../controllers/home.controller";

const router = Router();

router.get("/", getHomeFeed);

export default router;
