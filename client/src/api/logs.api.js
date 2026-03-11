import { api } from "./http";

export function getLogs(from, to) {
  return api(`/api/logs?from=${from}&to=${to}`);
}