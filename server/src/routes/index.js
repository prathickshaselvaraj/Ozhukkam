import { Router } from "express";
import metricsRoutes from "./metrics.routes.js";

const router = Router();

router.use("/metrics", metricsRoutes);

export default router;