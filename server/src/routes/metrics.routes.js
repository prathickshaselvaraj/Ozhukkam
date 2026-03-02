import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  createMetricSchema,
  listMetricsSchema,
  updateMetricSchema,
  idParamSchema
} from "../validators/metrics.schema.js";

import {
  createMetric,
  listMetrics,
  updateMetric,
  deleteMetric
} from "../controllers/metrics.controller.js";

const router = Router();

router.get("/", validate(listMetricsSchema), listMetrics);
router.post("/", validate(createMetricSchema), createMetric);
router.patch("/:id", validate(updateMetricSchema), updateMetric);
router.delete("/:id", validate(idParamSchema), deleteMetric);

export default router;