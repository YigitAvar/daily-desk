import { useMemo, useState } from "react";
import { initialTasks } from "./data/initialTasks";
import { loadTasks, saveTasks } from "./utils/storage";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const STORAGE_KEY = "daily-desk-tasks";

function App() {
  const [tasks, setTasks] = useState(() => {
    return loadTasks(STORAGE_KEY, initialTasks);
  });

  const [activeView, setActiveView] = useState("today");

  function updateTasks(nextTasks) {
    setTasks(nextTasks);
    saveTasks(STORAGE_KEY, nextTasks);
  }

  function addTask(text) {
    const newTask = {
      id: crypto.randomUUID(),
      text,
      status: activeView,
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

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.status === "today" && !task.completed),
    [tasks]
  );

  const backlogTasks = useMemo(
    () => tasks.filter((task) => task.status === "backlog" && !task.completed),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  const visibleTasks = activeView === "today" ? todayTasks : backlogTasks;

  return (
    <main className="app-shell">
      <Header onCloseDay={closeDay} />

      <section className="dashboard">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          todayCount={todayTasks.length}
          backlogCount={backlogTasks.length}
          completedCount={completedTasks.length}
        />

        <section className="task-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                {activeView === "today" ? "Focus Mode" : "Later Pool"}
              </p>
              <h2>{activeView === "today" ? "Today" : "Backlog"}</h2>
            </div>
          </div>

          <TaskForm activeView={activeView} onAddTask={addTask} />

          <TaskList
            activeView={activeView}
            tasks={visibleTasks}
            completedTasks={completedTasks}
            onCompleteTask={completeTask}
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
          />
        </section>
      </section>
    </main>
  );
}

export default App;
