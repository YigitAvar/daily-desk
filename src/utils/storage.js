export function loadTasks(storageKey, fallbackTasks) {
  try {
    const savedTasks = localStorage.getItem(storageKey);
    return savedTasks ? JSON.parse(savedTasks) : fallbackTasks;
  } catch {
    return fallbackTasks;
  }
}

export function saveTasks(storageKey, tasks) {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}
