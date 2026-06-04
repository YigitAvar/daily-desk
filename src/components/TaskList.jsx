function TaskList({
  activeView,
  tasks,
  completedTasks,
  onCompleteTask,
  onMoveTask,
  onDeleteTask,
}) {
  return (
    <>
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            {activeView === "today"
              ? "Bugün için görev yok. Ama 15 tane de ekleme; 3-5 net görev yeter."
              : "Backlog boş. Güzel, kafan temiz."}
          </div>
        ) : (
          tasks.map((task) => (
            <article className="task-card" key={task.id}>
              <button
                className="check-button"
                onClick={() => onCompleteTask(task.id)}
                aria-label="Complete task"
              >
                ✓
              </button>

              <p>{task.text}</p>

              <div className="task-actions">
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
            </article>
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <section className="completed-section">
          <h3>Çizilenler</h3>

          {completedTasks.map((task) => (
            <article className="task-card completed" key={task.id}>
              <p>{task.text}</p>
              <button onClick={() => onDeleteTask(task.id)}>Sil</button>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

export default TaskList;
