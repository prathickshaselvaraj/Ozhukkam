import prisma from "../config/prisma.js";

function isISODate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function toUTCDate(yyyy_mm_dd) {
  return new Date(`${yyyy_mm_dd}T00:00:00.000Z`);
}

function parseId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function listHabits(req, res, next) {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(habits);
  } catch (e) {
    next(e);
  }
}

export async function createHabit(req, res, next) {
  try {
    const name = (req.body?.name || "").trim();

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        userId: req.user.id
      }
    });

    res.status(201).json(habit);
  } catch (e) {
    next(e);
  }
}

export async function setHabitLog(req, res, next) {
  try {
    const habitId = parseId(req.params.id);

    if (!habitId) {
      return res.status(400).json({ error: "invalid habit id" });
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: req.user.id
      }
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const dateStr = (req.body?.date || "").trim();

    if (!isISODate(dateStr)) {
      return res.status(400).json({ error: "date must be YYYY-MM-DD" });
    }

    const done = Boolean(req.body?.done);
    const date = toUTCDate(dateStr);

    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: { habitId, date }
      },
      update: { done },
      create: { habitId, date, done }
    });

    res.json(log);
  } catch (e) {
    next(e);
  }
}

export async function updateHabit(req, res, next) {
  try {
    const habitId = parseId(req.params.id);
    if (!habitId) {
      return res.status(400).json({ error: "invalid habit id" });
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
    const active = typeof req.body?.active === "boolean" ? req.body.active : undefined;

    const existing = await prisma.habit.findFirst({
      where: { id: habitId, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const updated = await prisma.habit.update({
      where: { id: habitId },
      data: {
        ...(name ? { name } : {}),
        ...(active !== undefined ? { active } : {})
      }
    });

    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function deleteHabit(req, res, next) {
  try {
    const habitId = parseId(req.params.id);
    if (!habitId) {
      return res.status(400).json({ error: "invalid habit id" });
    }

    const existing = await prisma.habit.findFirst({
      where: { id: habitId, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Habit not found" });
    }

    await prisma.habit.delete({
      where: { id: habitId }
    });

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}