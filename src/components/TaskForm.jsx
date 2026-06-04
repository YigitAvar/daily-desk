import { useState } from "react";
import { categories, priorities } from "../data/options";

function TaskForm({ activeView, onAddTask }) {
  const [taskText, setTaskText] = useState("");
  const [category, setCategory] = useState("personal");
  const [priority, setPriority] = useState("medium");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedText = taskText.trim();

    if (!trimmedText) return;

    onAddTask({
      text: trimmedText,
      category,
      priority,
    });

    setTaskText("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        value={taskText}
        onChange={(event) => setTaskText(event.target.value)}
        placeholder={
          activeView === "today"
            ? "Bugün yapılacak bir görev yaz..."
            : "Sonra bakılacak bir görev yaz..."
        }
      />

      <select value={category} onChange={(event) => setCategory(event.target.value)}>
        {categories.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <select value={priority} onChange={(event) => setPriority(event.target.value)}>
        {priorities.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button type="submit">Ekle</button>
    </form>
  );
}

export default TaskForm;
