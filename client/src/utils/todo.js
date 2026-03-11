export function loadTodos(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTodos(storageKey, todos) {
  localStorage.setItem(storageKey, JSON.stringify(todos));
}