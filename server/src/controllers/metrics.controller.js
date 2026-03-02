import * as metricsService from "../services/metrics.service.js";

export async function createMetric(req, res, next) {
  try {
    const metric = await metricsService.createMetric(req.body);
    res.status(201).json(metric);
  } catch (err) {
    // handle unique key constraint cleanly
    if (err.code === "P2002") {
      res.status(409);
      return next(new Error("Metric key already exists. Use a unique key."));
    }
    next(err);
  }
}

export async function listMetrics(req, res, next) {
  try {
    const activeStr = req.query.active;
    const active =
      activeStr === undefined ? undefined : activeStr.toLowerCase() === "true";

    const metrics = await metricsService.listMetrics({
      active: typeof active === "boolean" ? active : undefined,
      domain: req.query.domain
    });

    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

export async function updateMetric(req, res, next) {
  try {
    const updated = await metricsService.updateMetric(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.code === "P2025") {
      res.status(404);
      return next(new Error("Metric not found"));
    }
    if (err.code === "P2002") {
      res.status(409);
      return next(new Error("Metric key already exists. Use a unique key."));
    }
    next(err);
  }
}

export async function deleteMetric(req, res, next) {
  try {
    const deleted = await metricsService.softDeleteMetric(req.params.id);
    res.json(deleted);
  } catch (err) {
    if (err.code === "P2025") {
      res.status(404);
      return next(new Error("Metric not found"));
    }
    next(err);
  }
}