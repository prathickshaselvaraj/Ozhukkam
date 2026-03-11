import { Router } from "express";
import { getLogsRange } from "../controllers/logs.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);
router.get("/", getLogsRange);

export default router;