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

export function saveValue(storageKey, value) {
  try {
    localStorage.setItem(storageKey, value);
    return true;
  } catch {
    return false;
  }
}

export function restoreValue(storageKey, previousValue) {
  try {
    if (previousValue === null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, previousValue);
    }
    return true;
  } catch {
    return false;
  }
}
