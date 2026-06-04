export const categories = [
  { value: "work", label: "İş" },
  { value: "personal", label: "Kişisel" },
];

export const priorities = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
];

export function getCategoryLabel(value) {
  return categories.find((category) => category.value === value)?.label || "Kişisel";
}

export function getPriorityLabel(value) {
  return priorities.find((priority) => priority.value === value)?.label || "Orta";
}
