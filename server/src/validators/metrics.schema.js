import { z } from "zod";

const domainEnum = z.enum(["HEALTH", "CAREER", "DISCIPLINE", "COMMUNICATION", "LIFE"]);
const typeEnum = z.enum(["BOOLEAN", "NUMBER", "DURATION", "TIME", "SCALE", "TEXT"]);

export const listMetricsSchema = {
  query: z.object({
    active: z.string().optional(), // "true" / "false"
    domain: domainEnum.optional()
  })
};

export const createMetricSchema = {
  body: z.object({
    key: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/i, "Use letters/numbers/underscore only"),
    name: z.string().min(2).max(80),
    domain: domainEnum,
    type: typeEnum,

    unit: z.string().max(20).optional(),
    target: z.number().nonnegative().optional(),
    direction: z.enum(["min_is_good", "max_is_good"]).optional(),
    weight: z.number().positive().max(10).optional(),
    required: z.boolean().optional(),

    icon: z.string().optional(),
    quickLink: z.string().url().optional(),
    colorTag: z.string().optional(),
    config: z.any().optional()
  })
};

export const updateMetricSchema = {
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    key: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/i).optional(),
    name: z.string().min(2).max(80).optional(),
    domain: domainEnum.optional(),
    type: typeEnum.optional(),

    unit: z.string().max(20).optional().nullable(),
    target: z.number().nonnegative().optional().nullable(),
    direction: z.enum(["min_is_good", "max_is_good"]).optional().nullable(),
    weight: z.number().positive().max(10).optional(),
    required: z.boolean().optional(),
    active: z.boolean().optional(),

    icon: z.string().optional().nullable(),
    quickLink: z.string().url().optional().nullable(),
    colorTag: z.string().optional().nullable(),
    config: z.any().optional().nullable()
  })
};

export const idParamSchema = {
  params: z.object({
    id: z.string().uuid()
  })
};