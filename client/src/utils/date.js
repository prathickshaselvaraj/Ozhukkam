export const pad2 = (n) => String(n).padStart(2, "0");

export function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function monthStart(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`;
}

export function monthEnd(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const yyyy = d.getFullYear();
  const m = d.getMonth();
  const last = new Date(yyyy, m + 1, 0);
  return `${yyyy}-${pad2(m + 1)}-${pad2(last.getDate())}`;
}

export function daysInMonth(iso) {
  return Number(monthEnd(iso).slice(8, 10));
}

export function addDays(iso, delta) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function monthLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export function weekKeyFromIso(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.getDay();
  const diffToMon = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMon);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

export const keyOf = (habitId, isoDay) => `${habitId}|${isoDay}`;