export const categories = [
  { value: "work", label: "İş" },
  { value: "school", label: "Okul" },
  { value: "sport", label: "Spor" },
  { value: "personal", label: "Kişisel" },
];

export const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function getCategoryLabel(value) {
  return categories.find((category) => category.value === value)?.label || "Kişisel";
}

export function getPriorityLabel(value) {
  return priorities.find((priority) => priority.value === value)?.label || "Medium";
}
