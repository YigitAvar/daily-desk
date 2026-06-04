import { useState } from "react";

function TaskForm({ activeView, onAddTask }) {
  const [taskText, setTaskText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedText = taskText.trim();

    if (!trimmedText) return;

    onAddTask(trimmedText);
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

      <button type="submit">Ekle</button>
    </form>
  );
}

export default TaskForm;
