export function loadTasks(storageKey, fallbackTasks) {
  try {
    const savedTasks = localStorage.getItem(storageKey);
    if (!savedTasks) return fallbackTasks;

    const parsedTasks = JSON.parse(savedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : fallbackTasks;
  } catch {
    return fallbackTasks;
  }
}

export function saveTasks(storageKey, tasks) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
