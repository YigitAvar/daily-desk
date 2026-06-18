const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getLocalDateKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function normalizeDateKey(value) {
  if (value instanceof Date || typeof value === "number") {
    return getLocalDateKey(new Date(value));
  }

  if (typeof value !== "string" || !value.trim()) return null;

  const trimmedValue = value.trim();

  if (DATE_KEY_PATTERN.test(trimmedValue)) {
    const [year, month, day] = trimmedValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return getLocalDateKey(date) === trimmedValue ? trimmedValue : null;
  }

  return getLocalDateKey(new Date(trimmedValue));
}

export function getHistoryDateKey(day) {
  if (!day || typeof day !== "object") return null;

  return (
    normalizeDateKey(day.dateKey) ||
    normalizeDateKey(day.date) ||
    normalizeDateKey(day.dateString) ||
    normalizeDateKey(day.closedAt)
  );
}

export function getLocalDateFromKey(dateKey) {
  const normalizedKey = normalizeDateKey(dateKey);
  if (!normalizedKey) return null;

  const [year, month, day] = normalizedKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}
