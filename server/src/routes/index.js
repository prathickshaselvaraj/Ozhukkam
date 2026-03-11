import { Router } from "express";
import habitsRoutes from "./habits.routes.js";
import logsRoutes from "./logs.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/habits", habitsRoutes);
router.use("/logs", logsRoutes);

export default router;