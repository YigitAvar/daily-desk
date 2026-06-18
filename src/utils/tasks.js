export const LONG_TASK_LENGTH = 80;

export function getDaysWaiting(task) {
  const referenceDate = task.movedToBacklogAt || task.createdAt;

  if (!referenceDate) return 0;

  const created = new Date(referenceDate);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 0);
}

export function isLargeTaskText(text) {
  return text.length > LONG_TASK_LENGTH;
}

export function isLargeTask(task) {
  return isLargeTaskText(task.text);
}
