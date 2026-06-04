import { useState } from "react";
import { priorities } from "../data/options";

function TaskForm({ activeView, activeArea, onAddTask }) {
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("medium");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedText = taskText.trim();

    if (!trimmedText) return;

    onAddTask({
      text: trimmedText,
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
          activeArea === "work"
            ? activeView === "today"
              ? "Bugünkü iş görevini yaz..."
              : "Sonra bakılacak iş görevini yaz..."
            : activeView === "today"
              ? "Bugünkü kişisel görevini yaz..."
              : "Sonra bakılacak kişisel görevini yaz..."
        }
      />

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
