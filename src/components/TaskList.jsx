import { useState } from "react";
import { priorities, getCategoryLabel, getPriorityLabel } from "../data/options";

function TaskList({
  activeView,
  tasks,
  completedTasks,
  onCompleteTask,
  onUpdateTask,
  onMoveTask,
  onDeleteTask,
}) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("medium");

  function startEditing(task) {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setEditPriority(task.priority || "medium");
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditText("");
    setEditPriority("medium");
  }

  function saveEditing(taskId) {
    const trimmedText = editText.trim();

    if (!trimmedText) return;

    onUpdateTask(taskId, {
      text: trimmedText,
      priority: editPriority,
    });

    cancelEditing();
  }

  return (
    <>
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            {activeView === "today"
              ? "Bugün için görev yok. 3-5 net görev yeter."
              : "Backlog boş. Güzel, kafan temiz."}
          </div>
        ) : (
          tasks.map((task) => {
            const isEditing = editingTaskId === task.id;

            return (
              <article className="task-card" key={task.id}>
                {isEditing ? (
                  <div className="edit-task-box">
                    <input
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                    />

                    <div className="edit-controls">
                      <select
                        value={editPriority}
                        onChange={(event) => setEditPriority(event.target.value)}
                      >
                        {priorities.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      <button onClick={() => saveEditing(task.id)}>Kaydet</button>
                      <button onClick={cancelEditing}>Vazgeç</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="check-button"
                      onClick={() => onCompleteTask(task.id)}
                      aria-label="Complete task"
                    >
                      ✓
                    </button>

                    <div className="task-content">
                      <p>{task.text}</p>

                      <div className="task-meta">
                        <span className="badge category-badge">
                          {getCategoryLabel(task.category)}
                        </span>

                        <span className={`badge priority-badge ${task.priority}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button onClick={() => startEditing(task)}>Düzenle</button>

                      {activeView === "today" ? (
                        <button onClick={() => onMoveTask(task.id, "backlog")}>
                          Backlog
                        </button>
                      ) : (
                        <button onClick={() => onMoveTask(task.id, "today")}>
                          Today
                        </button>
                      )}

                      <button onClick={() => onDeleteTask(task.id)}>Sil</button>
                    </div>
                  </>
                )}
              </article>
            );
          })
        )}
      </div>

      {completedTasks.length > 0 && (
        <section className="completed-section">
          <h3>Çizilenler</h3>

          {completedTasks.map((task) => (
            <article className="task-card completed" key={task.id}>
              <div>
                <p>{task.text}</p>

                <div className="task-meta">
                  <span className="badge category-badge">
                    {getCategoryLabel(task.category)}
                  </span>

                  <span className={`badge priority-badge ${task.priority}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
              </div>

              <button onClick={() => onDeleteTask(task.id)}>Sil</button>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

export default TaskList;
