import { useMemo, useState } from "react";
import { initialTasks } from "./data/initialTasks";
import { loadTasks, saveTasks } from "./utils/storage";
import Header from "./components/Header";
import DeskColumn from "./components/DeskColumn";

const STORAGE_KEY = "daily-desk-tasks";

function normalizeTasks(tasks) {
  return tasks.map((task) => ({
    ...task,
    category:
      task.category === "school" || task.category === "sport"
        ? "personal"
        : task.category || "personal",
    priority: task.priority || "medium",
  }));
}

function App() {
  const [tasks, setTasks] = useState(() => {
    return normalizeTasks(loadTasks(STORAGE_KEY, initialTasks));
  });

  function updateTasks(nextTasks) {
    setTasks(nextTasks);
    saveTasks(STORAGE_KEY, nextTasks);
  }

  function addTask(category, status, taskData) {
    const newTask = {
      id: crypto.randomUUID(),
      text: taskData.text,
      status,
      category,
      priority: taskData.priority,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    updateTasks([newTask, ...tasks]);
  }

  function completeTask(taskId) {
    const nextTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: true,
            completedAt: new Date().toISOString(),
          }
        : task
    );

    updateTasks(nextTasks);
  }

  function updateTask(taskId, updatedData) {
    const nextTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            text: updatedData.text,
            priority: updatedData.priority,
          }
        : task
    );

    updateTasks(nextTasks);
  }

  function moveTask(taskId, targetStatus) {
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: targetStatus } : task
    );

    updateTasks(nextTasks);
  }

  function deleteTask(taskId) {
    const nextTasks = tasks.filter((task) => task.id !== taskId);
    updateTasks(nextTasks);
  }

  function clearCompletedTasks(category) {
    const completedCount = tasks.filter(
      (task) => task.category === category && task.completed
    ).length;

    if (completedCount === 0) return;

    const confirmed = confirm(
      `${completedCount} çizilen görev temizlenecek. Emin misin?`
    );

    if (!confirmed) return;

    const nextTasks = tasks.filter(
      (task) => !(task.category === category && task.completed)
    );

    updateTasks(nextTasks);
  }

  function closeDay() {
    const unfinishedTodayTasks = tasks.filter(
      (task) => task.status === "today" && !task.completed
    );

    if (unfinishedTodayTasks.length === 0) {
      alert("Bugün açık görev kalmadı. Temiz kapattın.");
      return;
    }

    const shouldMoveToBacklog = confirm(
      `${unfinishedTodayTasks.length} görev bitmedi. Bunları Backlog'a taşıyalım mı?`
    );

    if (!shouldMoveToBacklog) return;

    const nextTasks = tasks.map((task) =>
      task.status === "today" && !task.completed
        ? { ...task, status: "backlog" }
        : task
    );

    updateTasks(nextTasks);
  }

  const workTasks = useMemo(
    () => tasks.filter((task) => task.category === "work"),
    [tasks]
  );

  const personalTasks = useMemo(
    () => tasks.filter((task) => task.category === "personal"),
    [tasks]
  );

  return (
    <main className="app-shell">
      <Header onCloseDay={closeDay} />

      <section className="dual-desk-layout">
        <DeskColumn
          title="İş"
          subtitle="Ticket, kurulum, mail, teknik takip"
          category="work"
          tasks={workTasks}
          onAddTask={addTask}
          onCompleteTask={completeTask}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
          onClearCompletedTasks={clearCompletedTasks}
        />

        <DeskColumn
          title="Kişisel"
          subtitle="Spor, kariyer, proje, özel işler"
          category="personal"
          tasks={personalTasks}
          onAddTask={addTask}
          onCompleteTask={completeTask}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
          onClearCompletedTasks={clearCompletedTasks}
        />
      </section>
    </main>
  );
}

export default App;
