import { useMemo, useState } from "react";
import { priorities, getPriorityLabel } from "../data/options";

const TODAY_TASK_LIMIT = 5;
const MIN_TASK_LENGTH = 3;
const LONG_TASK_LENGTH = 80;
const BACKLOG_WARNING_DAYS = 3;
const BACKLOG_DANGER_DAYS = 7;

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

function normalizeText(text) {
  return text.trim().replace(/\s+/g, " ");
}

function getDaysWaiting(task) {
  const referenceDate = task.movedToBacklogAt || task.createdAt;

  if (!referenceDate) return 0;

  const created = new Date(referenceDate);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 0);
}

function getBacklogAgeLevel(daysWaiting) {
  if (daysWaiting >= BACKLOG_DANGER_DAYS) return "danger";
  if (daysWaiting >= BACKLOG_WARNING_DAYS) return "warning";
  return "normal";
}

function isLargeTaskText(text) {
  return text.length > LONG_TASK_LENGTH;
}

function LargeTaskConfirmModal({ taskText, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <section className="close-day-modal large-task-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Task Check</p>
            <h2>Büyük Görev</h2>
            <p>
              Bu görev biraz büyük görünüyor. Tek görev olarak ekleyebilir veya geri dönüp daha küçük parçalara bölebilirsin.
            </p>
          </div>

          <button className="modal-close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="large-task-preview">
          {taskText}
        </div>

        <div className="modal-actions">
          <button className="secondary-action" onClick={onCancel}>
            Geri Dön
          </button>

          <button className="primary-action" onClick={onConfirm}>
            Tek Görev Olarak Ekle
          </button>
        </div>
      </section>
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
  const [formMessage, setFormMessage] = useState(null);
  const [pendingLargeTask, setPendingLargeTask] = useState(null);

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.status === "today" && !task.completed),
    [tasks]
  );

  const backlogTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status === "backlog" && !task.completed)
        .sort((a, b) => getDaysWaiting(b) - getDaysWaiting(a)),
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

  const agedBacklogCount = useMemo(
    () =>
      backlogTasks.filter((task) => getDaysWaiting(task) >= BACKLOG_WARNING_DAYS)
        .length,
    [backlogTasks]
  );

  function clearFormMessageSoon() {
    window.setTimeout(() => {
      setFormMessage(null);
    }, 3500);
  }

  function showMessage(type, text) {
    setFormMessage({ type, text });
    clearFormMessageSoon();
  }

  function hasDuplicateActiveTask(text) {
    const normalizedNewText = text.toLocaleLowerCase("tr-TR");

    return tasks.some((task) => {
      const normalizedTaskText = task.text
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("tr-TR");

      return !task.completed && normalizedTaskText === normalizedNewText;
    });
  }

  function addValidatedTask(text, selectedPriority) {
    onAddTask(category, "today", {
      text,
      priority: selectedPriority,
    });

    setTaskText("");
    
  }

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedTaskText = normalizeText(taskText);

    if (normalizedTaskText.length < MIN_TASK_LENGTH) {
      showMessage(
        "error",
        "Görev en az 3 karakter olmalı. 'a' gibi test görevleri listeyi kirletir."
      );
      return;
    }

    if (hasDuplicateActiveTask(normalizedTaskText)) {
      showMessage(
        "error",
        "Bu görev zaten aktif listede var. Aynısını tekrar eklemeyelim."
      );
      return;
    }

    if (todayTasks.length >= TODAY_TASK_LIMIT) {
      const confirmed = confirm(
        `Today listesinde zaten ${todayTasks.length} görev var. Bu gerçekçi olmayabilir. Yine de eklemek istiyor musun?`
      );

      if (!confirmed) {
        showMessage(
          "warning",
          "Mantıklı karar. Bugünlük listeyi şişirmemek daha iyi."
        );
        return;
      }
    }

    if (isLargeTaskText(normalizedTaskText)) {
      setPendingLargeTask({
        text: normalizedTaskText,
        priority,
      });
      return;
    }

    addValidatedTask(normalizedTaskText, priority);
  }

  function confirmLargeTask() {
    if (!pendingLargeTask) return;

    addValidatedTask(pendingLargeTask.text, pendingLargeTask.priority, true);
    setPendingLargeTask(null);
  }

  function cancelLargeTask() {
    setPendingLargeTask(null);
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
    const trimmedText = normalizeText(editText);

    if (trimmedText.length < MIN_TASK_LENGTH) {
      showMessage("error", "Düzenlenen görev en az 3 karakter olmalı.");
      return;
    }

    onUpdateTask(taskId, {
      text: trimmedText,
      priority: editPriority,
    });

    cancelEditing();
  }

  function renderBacklogAge(task) {
    const daysWaiting = getDaysWaiting(task);
    const ageLevel = getBacklogAgeLevel(daysWaiting);

    if (daysWaiting <= 0) {
      return null;
    }

    return (
      <span className={`backlog-age-badge ${ageLevel}`}>
        {daysWaiting} gündür bekliyor
      </span>
    );
  }

  function renderTask(task, source) {
    const isEditing = editingTaskId === task.id;
    const isBacklog = source === "backlog";
    const isLargeTask = isLargeTaskText(task.text);

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
              aria-label="Görevi tamamla"
            >
              ✓
            </button>

            <div className="compact-task-content">
              <p>{task.text}</p>

              <div className="task-meta">
                <span className={`badge priority-badge ${task.priority}`}>
                  {getPriorityLabel(task.priority)}
                </span>

                {isLargeTask && (
                  <span className="large-task-badge">Büyük görev</span>
                )}

                {isBacklog && renderBacklogAge(task)}
              </div>
            </div>

            <div className="compact-task-actions">
              <button onClick={() => startEditing(task)}>Düzenle</button>

              {source === "today" ? (
                <button onClick={() => onMoveTask(task.id, "backlog")}>
                  Backlog&apos;a Al
                </button>
              ) : (
                <button onClick={() => onMoveTask(task.id, "today")}>
                  Today&apos;e Al
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
          {agedBacklogCount > 0 && <span>{agedBacklogCount} Bekleyen</span>}
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

      {formMessage && (
        <div className={`form-message ${formMessage.type}`}>
          {formMessage.text}
        </div>
      )}

      {todayTasks.length >= TODAY_TASK_LIMIT && (
        <div className="daily-limit-warning">
          Today listesinde {todayTasks.length} görev var. Bugünlük planı sade tutmak daha mantıklı olabilir.
        </div>
      )}

      {agedBacklogCount > 0 && (
        <div className="backlog-summary-alert">
          <strong>{agedBacklogCount} Backlog uyarısı</strong>
          <span>
            Uzun süredir bekleyen görev var. Today'e al, sil veya parçala.
          </span>
        </div>
      )}

      <div className="column-section">
        <div className="column-section-title">
          <h3>Today</h3>
          <span>{todayTasks.length}</span>
        </div>

        <div className="compact-task-list">
          {todayTasks.length === 0 ? (
            <div className="small-empty-state">
              Bugün için görev yok. Yukarıdan bir görev ekleyebilirsin.
            </div>
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
              <div className="small-empty-state">
                Backlog boş. Ertelediğin görevler burada görünür.
              </div>
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
                Çizilenleri Temizle
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

      {pendingLargeTask && (
        <LargeTaskConfirmModal
          taskText={pendingLargeTask.text}
          onCancel={cancelLargeTask}
          onConfirm={confirmLargeTask}
        />
      )}
    </section>
  );
}

export default DeskColumn;

