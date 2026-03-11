import { addDays, keyOf, pad2 } from "./date";

export function completionForDay(activeHabits, doneMap, isoDay) {
  const total = activeHabits.length;
  if (!total) return 0;

  let done = 0;
  for (const h of activeHabits) {
    if (doneMap[keyOf(h.id, isoDay)]) done++;
  }
  return Math.round((done / total) * 100);
}

export function completionForMonth(activeHabits, doneMap, yyyyMm, totalDays) {
  const totalCells = activeHabits.length * totalDays;
  if (!totalCells) return 0;

  let doneCells = 0;
  for (const h of activeHabits) {
    for (let day = 1; day <= totalDays; day++) {
      const isoDay = `${yyyyMm}-${pad2(day)}`;
      if (doneMap[keyOf(h.id, isoDay)]) doneCells++;
    }
  }
  return Math.round((doneCells / totalCells) * 100);
}

export function computeOverallStreak(activeHabits, doneMap, todayIso, lookbackDays = 120, threshold = 60) {
  let streak = 0;
  for (let i = 0; i < lookbackDays; i++) {
    const iso = addDays(todayIso, -i);
    const pct = completionForDay(activeHabits, doneMap, iso);
    if (pct >= threshold) streak++;
    else break;
  }
  return streak;
}

export function dailyCompletionSeries(activeHabits, doneMap, yyyyMm, totalDays) {
  const series = [];
  for (let day = 1; day <= totalDays; day++) {
    const isoDay = `${yyyyMm}-${pad2(day)}`;
    const pct = completionForDay(activeHabits, doneMap, isoDay);
    series.push({ isoDay, day, pct });
  }
  return series;
}

export function habitCompletionRanking(activeHabits, doneMap, yyyyMm, totalDays) {
  const rows = activeHabits.map((h) => {
    let done = 0;
    for (let day = 1; day <= totalDays; day++) {
      const isoDay = `${yyyyMm}-${pad2(day)}`;
      if (doneMap[keyOf(h.id, isoDay)]) done++;
    }
    const pct = totalDays ? Math.round((done / totalDays) * 100) : 0;
    return { id: h.id, name: h.name, done, pct };
  });

  rows.sort((a, b) => b.done - a.done);
  return rows;
}

export function habitMonthStats(activeHabits, doneMap, yyyyMm, totalDays) {
  return activeHabits.map((h) => {
    let doneDays = 0;
    let lastDone = null;

    for (let day = 1; day <= totalDays; day++) {
      const isoDay = `${yyyyMm}-${pad2(day)}`;
      if (doneMap[keyOf(h.id, isoDay)]) {
        doneDays++;
        lastDone = isoDay;
      }
    }

    const pct = totalDays ? Math.round((doneDays / totalDays) * 100) : 0;
    return { id: h.id, name: h.name, doneDays, pct, lastDone };
  });
}

export function habitLastNDaysStats(activeHabits, doneMap, endIso, n = 7) {
  return activeHabits.map((h) => {
    let done = 0;
    let lastDone = null;

    for (let i = 0; i < n; i++) {
      const isoDay = addDays(endIso, -i);
      if (doneMap[keyOf(h.id, isoDay)]) {
        done++;
        if (!lastDone) lastDone = isoDay;
      }
    }

    return { id: h.id, name: h.name, done, lastDone };
  });
}