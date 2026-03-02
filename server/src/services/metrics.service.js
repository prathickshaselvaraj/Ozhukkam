import { prisma } from "../config/prisma.js";

export async function createMetric(data) {
  return prisma.metricTemplate.create({ data });
}

export async function listMetrics({ active, domain }) {
  const where = {};
  if (typeof active === "boolean") where.active = active;
  if (domain) where.domain = domain;

  return prisma.metricTemplate.findMany({
    where,
    orderBy: [{ domain: "asc" }, { name: "asc" }]
  });
}

export async function updateMetric(id, data) {
  return prisma.metricTemplate.update({
    where: { id },
    data
  });
}

export async function softDeleteMetric(id) {
  return prisma.metricTemplate.update({
    where: { id },
    data: { active: false }
  });
}