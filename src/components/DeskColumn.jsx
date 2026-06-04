import { useMemo, useState } from "react";
import { priorities, getPriorityLabel } from "../data/options";

function PriorityPicker({ value, onChange, compact = false }) {
  return (
    <div className={compact ? "priority-picker compact" : "priority-picker"}>
      {priorities.map((item) => (
        <button
          key={item.value}
          type="button"
          className={
            value === item.value
              ? `priority-option active ${item.value}`
              : `priority-option ${item.value}`
          }
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function DeskColumn({
  title,
  subtitle,
  category,
  tasks,
  onAddTask,
  onCompleteTask,
  onUpdateTask,
  onMoveTask,
  onDeleteTask,
  onClearCompletedTasks,
}) {
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [showBacklog, setShowBacklog] = useState(true);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.status === "today" && !task.completed),
    [tasks]
  );

  const backlogTasks = useMemo(
    () => tasks.filter((task) => task.status === "backlog" && !task.completed),
    [tasks]
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.completed)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
    [tasks]
  );

  const visibleCompletedTasks = showAllCompleted
    ? completedTasks
    : completedTasks.slice(0, 2);

  const highPriorityCount = useMemo(
    () => todayTasks.filter((task) => task.priority === "high").length,
    [todayTasks]
  );

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedText = taskText.trim();

    if (!trimmedText) return;

    onAddTask(category, "today", {
      text: trimmedText,
      priority,
    });

    setTaskText("");
  }

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

  function renderTask(task, source) {
    const isEditing = editingTaskId === task.id;

    return (
      <article className="compact-task-card" key={task.id}>
        {isEditing ? (
          <div className="compact-edit-box">
            <input
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
            />

            <div className="compact-edit-actions">
              <PriorityPicker
                value={editPriority}
                onChange={setEditPriority}
                compact
              />

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

            <div className="compact-task-content">
              <p>{task.text}</p>

              <div className="task-meta">
                <span className={`badge priority-badge ${task.priority}`}>
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
            </div>

            <div className="compact-task-actions">
              <button onClick={() => startEditing(task)}>Düzenle</button>

              {source === "today" ? (
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
  }

  return (
    <section className="desk-column">
      <div className="desk-column-header">
        <div>
          <p className="eyebrow">
            {category === "work" ? "Work Desk" : "Personal Desk"}
          </p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="desk-stats">
          <span>{todayTasks.length} Today</span>
          <span>{backlogTasks.length} Backlog</span>
          <span>{highPriorityCount} High</span>
        </div>
      </div>

      <form className="compact-task-form" onSubmit={handleSubmit}>
        <input
          value={taskText}
          onChange={(event) => setTaskText(event.target.value)}
          placeholder={category === "work" ? "İş görevi yaz..." : "Kişisel görev yaz..."}
        />

        <PriorityPicker value={priority} onChange={setPriority} />

        <button type="submit">Ekle</button>
      </form>

      <div className="column-section">
        <div className="column-section-title">
          <h3>Today</h3>
          <span>{todayTasks.length}</span>
        </div>

        <div className="compact-task-list">
          {todayTasks.length === 0 ? (
            <div className="small-empty-state">Bugün için görev yok.</div>
          ) : (
            todayTasks.map((task) => renderTask(task, "today"))
          )}
        </div>
      </div>

      <div className="column-section">
        <button
          className="backlog-toggle"
          onClick={() => setShowBacklog((current) => !current)}
        >
          <span>Backlog</span>
          <strong>{backlogTasks.length}</strong>
        </button>

        {showBacklog && (
          <div className="compact-task-list">
            {backlogTasks.length === 0 ? (
              <div className="small-empty-state">Backlog boş.</div>
            ) : (
              backlogTasks.map((task) => renderTask(task, "backlog"))
            )}
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="column-section completed-compact-section">
          <div className="completed-header">
            <div className="column-section-title">
              <h3>Çizilenler</h3>
              <span>{completedTasks.length}</span>
            </div>

            <div className="completed-actions">
              {completedTasks.length > 2 && (
                <button onClick={() => setShowAllCompleted((current) => !current)}>
                  {showAllCompleted ? "Daha Az" : "Tümünü Göster"}
                </button>
              )}

              <button
                className="danger-action"
                onClick={() => onClearCompletedTasks(category)}
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="compact-task-list">
            {visibleCompletedTasks.map((task) => (
              <article className="compact-task-card completed" key={task.id}>
                <div>
                  <p>{task.text}</p>
                  <span className={`badge priority-badge ${task.priority}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>

                <button onClick={() => onDeleteTask(task.id)}>Sil</button>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default DeskColumn;
