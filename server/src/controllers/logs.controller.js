import prisma from "../config/prisma.js";

function isISODate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function toUTCDate(yyyy_mm_dd) {
  return new Date(`${yyyy_mm_dd}T00:00:00.000Z`);
}

function toUTCEndOfDay(yyyy_mm_dd) {
  return new Date(`${yyyy_mm_dd}T23:59:59.999Z`);
}

export async function getLogsRange(req, res, next) {
  try {
    const from = (req.query.from || "").trim();
    const to = (req.query.to || "").trim();

    if (!isISODate(from) || !isISODate(to)) {
      return res.status(400).json({ error: "from/to must be YYYY-MM-DD" });
    }

    const logs = await prisma.habitLog.findMany({
      where: {
        date: {
          gte: toUTCDate(from),
          lte: toUTCEndOfDay(to)
        },
        habit: {
          userId: req.user.id
        }
      },
      include: { habit: true },
      orderBy: [{ date: "asc" }]
    });

    res.json(logs);
  } catch (e) {
    next(e);
  }
}