import { api } from "./http";

export function getHabits() {
  return api("/api/habits");
}

export function createHabit(name) {
  return api("/api/habits", {
    method: "POST",
    body: JSON.stringify({ name })
  });
}

export function setHabitLog(habitId, date, done) {
  return api(`/api/habits/${habitId}/log`, {
    method: "PUT",
    body: JSON.stringify({ date, done })
  });
}

export function updateHabit(id, name) {
  return api(`/api/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name })
  });
}

export function deleteHabit(id) {
  return api(`/api/habits/${id}`, {
    method: "DELETE"
  });
}