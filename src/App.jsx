import { useEffect, useMemo, useState } from "react";
import { initialTasks } from "./data/initialTasks";
import { loadTasks, saveTasks } from "./utils/storage";
import {
  getHistoryDateKey,
  getLocalDateFromKey,
  getLocalDateKey,
  normalizeDateKey,
} from "./utils/date";
import Header from "./components/Header";
import DeskColumn from "./components/DeskColumn";
import CloseDayModal from "./components/CloseDayModal";
import HistoryModal from "./components/HistoryModal";
import SettingsModal from "./components/SettingsModal";
import NotificationsModal from "./components/NotificationsModal";

const TASKS_STORAGE_KEY = "daily-desk-tasks";
const HISTORY_STORAGE_KEY = "daily-desk-history";
const LAST_ACTIVE_DATE_KEY = "daily-desk-last-active-date";

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .filter(
      (task) =>
        task &&
        typeof task === "object" &&
        typeof task.text === "string"
    )
    .map((task) => ({
      ...task,
      category:
        task.category === "work"
          ? "work"
          : task.category === "school" || task.category === "sport"
          ? "personal"
          : "personal",
      status: task.status === "today" ? "today" : "backlog",
      priority: ["low", "medium", "high"].includes(task.priority)
        ? task.priority
        : "medium",
      completed: Boolean(task.completed),
    }));
}

function mergeTaskSnapshots(...snapshotGroups) {
  const snapshotsById = new Map();

  snapshotGroups.flat().forEach((task, index) => {
    if (!task || typeof task !== "object") return;

    const snapshotId = task.id || `legacy-${index}-${task.text || ""}`;
    snapshotsById.set(snapshotId, task);
  });

  return Array.from(snapshotsById.values());
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const recordsByDate = new Map();
  const recordsWithoutDate = [];

  history.forEach((day, index) => {
    if (!day || typeof day !== "object") return;

    const dateKey = getHistoryDateKey(day);
    const historyDate = getLocalDateFromKey(dateKey);
    const completedTasks = Array.isArray(day.completedTasks)
      ? day.completedTasks.filter((task) => {
          if (!task || typeof task !== "object") return false;

          const completedDateKey = normalizeDateKey(task.completedAt);
          return !dateKey || !completedDateKey || completedDateKey === dateKey;
        })
      : [];
    const unfinishedTasks = Array.isArray(day.unfinishedTasks)
      ? day.unfinishedTasks.filter(
          (task) => task && typeof task === "object"
        )
      : [];
    const normalizedDay = {
      ...day,
      id: day.id || `history-${dateKey || "unknown"}-${index}`,
      ...(dateKey ? { dateKey } : {}),
      dateLabel:
        day.dateLabel || (historyDate ? formatDateLabel(historyDate) : "Tarih yok"),
      closedAtLabel:
        day.closedAtLabel ||
        (normalizeDateKey(day.closedAt)
          ? formatTimeLabel(new Date(day.closedAt))
          : "—"),
      completedTasks,
      unfinishedTasks,
    };

    if (!dateKey) {
      recordsWithoutDate.push(normalizedDay);
      return;
    }

    const existingDay = recordsByDate.get(dateKey);

    if (!existingDay) {
      recordsByDate.set(dateKey, normalizedDay);
      return;
    }

    const existingClosedAt = new Date(existingDay.closedAt).getTime() || 0;
    const nextClosedAt = new Date(normalizedDay.closedAt).getTime() || 0;
    const latestDay =
      nextClosedAt >= existingClosedAt ? normalizedDay : existingDay;

    recordsByDate.set(dateKey, {
      ...existingDay,
      ...latestDay,
      id: existingDay.id,
      dateKey,
      completedTasks: mergeTaskSnapshots(
        existingDay.completedTasks,
        normalizedDay.completedTasks
      ),
      unfinishedTasks: mergeTaskSnapshots(
        existingDay.unfinishedTasks,
        normalizedDay.unfinishedTasks
      ),
    });
  });

  return [...recordsByDate.values(), ...recordsWithoutDate].sort((a, b) => {
    const aTime =
      new Date(a.closedAt).getTime() ||
      getLocalDateFromKey(getHistoryDateKey(a))?.getTime() ||
      0;
    const bTime =
      new Date(b.closedAt).getTime() ||
      getLocalDateFromKey(getHistoryDateKey(b))?.getTime() ||
      0;
    return bTime - aTime;
  });
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTimeLabel(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

function isLargeTask(task) {
  return task.text.length > 80;
}

function isValidImportedData(data) {
  return (
    data &&
    Array.isArray(data.tasks) &&
    Array.isArray(data.history) &&
    data.app === "daily-desk"
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    return normalizeTasks(loadTasks(TASKS_STORAGE_KEY, initialTasks));
  });

  const [history, setHistory] = useState(() => {
    return normalizeHistory(loadTasks(HISTORY_STORAGE_KEY, []));
  });

  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [closeDayMode, setCloseDayMode] = useState("manual");

  function updateTasks(nextTasks) {
    setTasks(nextTasks);
    saveTasks(TASKS_STORAGE_KEY, nextTasks);
  }

  function updateHistory(nextHistory) {
    setHistory(nextHistory);
    saveTasks(HISTORY_STORAGE_KEY, nextHistory);
  }

  function markTodayAsActiveDate() {
    localStorage.setItem(LAST_ACTIVE_DATE_KEY, getLocalDateKey(new Date()));
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
      task.id === taskId ? { ...task, status: targetStatus, movedToBacklogAt: targetStatus === "backlog" ? new Date().toISOString() : task.movedToBacklogAt } : task
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

  function clearAllTasksFromSettings() {
    if (tasks.length === 0) return;

    const confirmed = confirm("Tüm görevler silinecek. Emin misin?");

    if (!confirmed) return;

    updateTasks([]);
  }

  function clearCompletedTasksFromSettings() {
    const completedCount = tasks.filter((task) => task.completed).length;

    if (completedCount === 0) return;

    const confirmed = confirm(
      `${completedCount} çizilen görev silinecek. Emin misin?`
    );

    if (!confirmed) return;

    updateTasks(tasks.filter((task) => !task.completed));
  }

  function clearHistory() {
    if (history.length === 0) return;

    const confirmed = confirm("Tüm günlük özet geçmişi silinecek. Emin misin?");

    if (!confirmed) return;

    updateHistory([]);
  }

  function resetApp() {
    const confirmed = confirm(
      "Uygulama tamamen sıfırlanacak. Tüm görevler, geçmiş ve günlük takip bilgisi silinecek. Emin misin?"
    );

    if (!confirmed) return;

    localStorage.removeItem(TASKS_STORAGE_KEY);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVE_DATE_KEY);

    setTasks([]);
    setHistory([]);
    setIsSettingsModalOpen(false);
    setIsHistoryModalOpen(false);
    setIsCloseDayModalOpen(false);
  }

  function exportData() {
    const now = new Date();

    const backup = {
      app: "daily-desk",
      version: 1,
      exportedAt: now.toISOString(),
      tasks,
      history,
      lastActiveDate: localStorage.getItem(LAST_ACTIVE_DATE_KEY),
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const fileDate = getLocalDateKey(now);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily-desk-backup-${fileDate}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsedData = JSON.parse(reader.result);

        if (!isValidImportedData(parsedData)) {
          alert("Bu dosya geçerli bir Daily Desk yedeği gibi görünmüyor.");
          return;
        }

        const confirmed = confirm(
          "Bu yedek içe aktarılacak. Mevcut görevler ve geçmiş bununla değiştirilecek. Emin misin?"
        );

        if (!confirmed) return;

        const importedTasks = normalizeTasks(parsedData.tasks);
        const importedHistory = normalizeHistory(parsedData.history);

        updateTasks(importedTasks);
        updateHistory(importedHistory);

        if (parsedData.lastActiveDate) {
          localStorage.setItem(LAST_ACTIVE_DATE_KEY, parsedData.lastActiveDate);
        } else {
          markTodayAsActiveDate();
        }

        alert("Yedek başarıyla içe aktarıldı.");
      } catch {
        alert("Yedek dosyası okunamadı. JSON formatı bozuk olabilir.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function openCloseDayModal(mode = "manual") {
    setCloseDayMode(mode);
    setIsCloseDayModalOpen(true);
  }

  function closeCloseDayModal() {
    setIsCloseDayModalOpen(false);
    markTodayAsActiveDate();
  }

  function openHistoryModal() {
    setIsHistoryModalOpen(true);
  }

  function closeHistoryModal() {
    setIsHistoryModalOpen(false);
  }

  function openSettingsModal() {
    setIsSettingsModalOpen(true);
  }

  function closeSettingsModal() {
    setIsSettingsModalOpen(false);
  }

  function openNotificationsModal() {
    setIsNotificationsModalOpen(true);
  }

  function closeNotificationsModal() {
    setIsNotificationsModalOpen(false);
  }

  function moveUnfinishedTodayTasksToBacklog() {
    const now = new Date();
    const storedActiveDate = normalizeDateKey(
      localStorage.getItem(LAST_ACTIVE_DATE_KEY)
    );
    const closingDateKey =
      closeDayMode === "auto" && storedActiveDate
        ? storedActiveDate
        : getLocalDateKey(now);
    const closingDate = getLocalDateFromKey(closingDateKey) || now;

    const completedSnapshot = completedTasks
      .filter(
        (task) => normalizeDateKey(task.completedAt) === closingDateKey
      )
      .map((task) => ({
        id: task.id,
        text: task.text,
        category: task.category,
        priority: task.priority,
        completedAt: task.completedAt,
      }));

    const unfinishedSnapshot = unfinishedTodayTasks.map((task) => ({
      id: task.id,
      text: task.text,
      category: task.category,
      priority: task.priority,
      createdAt: task.createdAt,
    }));

    const sameDayRecords = history.filter(
      (day) => getHistoryDateKey(day) === closingDateKey
    );
    const existingDay = sameDayRecords[0];
    const daySummary = {
      ...existingDay,
      id: existingDay?.id || crypto.randomUUID(),
      dateKey: closingDateKey,
      closedAt: now.toISOString(),
      dateLabel: formatDateLabel(closingDate),
      closedAtLabel: formatTimeLabel(now),
      completedTasks: mergeTaskSnapshots(
        ...sameDayRecords.map((day) => day.completedTasks || []),
        completedSnapshot
      ),
      unfinishedTasks: mergeTaskSnapshots(
        ...sameDayRecords.map((day) => day.unfinishedTasks || []),
        unfinishedSnapshot
      ),
    };

    const nextHistory = [
      daySummary,
      ...history.filter((day) => getHistoryDateKey(day) !== closingDateKey),
    ];

    const nextTasks = tasks.map((task) =>
      task.status === "today" && !task.completed
        ? { ...task, status: "backlog", movedToBacklogAt: new Date().toISOString() }
        : task
    );

    updateHistory(nextHistory);
    updateTasks(nextTasks);
    markTodayAsActiveDate();
    setIsCloseDayModalOpen(false);
  }

  const workTasks = useMemo(
    () => tasks.filter((task) => task.category === "work"),
    [tasks]
  );

  const personalTasks = useMemo(
    () => tasks.filter((task) => task.category === "personal"),
    [tasks]
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.completed)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
    [tasks]
  );

  const completedTasksForClosing = (() => {
    const storedActiveDate = normalizeDateKey(
      localStorage.getItem(LAST_ACTIVE_DATE_KEY)
    );
    const closingDateKey =
      closeDayMode === "auto" && storedActiveDate
        ? storedActiveDate
        : getLocalDateKey(new Date());

    return completedTasks.filter(
      (task) => normalizeDateKey(task.completedAt) === closingDateKey
    );
  })();

  const unfinishedTodayTasks = useMemo(
    () => tasks.filter((task) => task.status === "today" && !task.completed),
    [tasks]
  );

  const notifications = useMemo(() => {
    const alerts = [];

    const workTodayCount = tasks.filter(
      (task) => task.category === "work" && task.status === "today" && !task.completed
    ).length;

    const personalTodayCount = tasks.filter(
      (task) => task.category === "personal" && task.status === "today" && !task.completed
    ).length;

    if (workTodayCount >= 5) {
      alerts.push({
        id: "work-today-limit",
        type: "warning",
        category: "work",
        title: "İş Today listesi dolu",
        message: `İş tarafında ${workTodayCount} Today görevi var. Bugünlük planı sade tutmak daha mantıklı olabilir.`,
      });
    }

    if (personalTodayCount >= 5) {
      alerts.push({
        id: "personal-today-limit",
        type: "warning",
        category: "personal",
        title: "Kişisel Today listesi dolu",
        message: `Kişisel tarafta ${personalTodayCount} Today görevi var. Bugünlük planı sade tutmak daha mantıklı olabilir.`,
      });
    }

    tasks
      .filter((task) => task.status === "backlog" && !task.completed)
      .forEach((task) => {
        const daysWaiting = getDaysWaiting(task);

        if (daysWaiting >= 3) {
          alerts.push({
            id: `backlog-${task.id}`,
            type: daysWaiting >= 7 ? "danger" : "warning",
            category: task.category,
            title: `${daysWaiting} gündür Backlog'da`,
            message:
              daysWaiting >= 7
                ? "Bu görev uzun süredir bekliyor. Today'e al, sil veya parçala."
                : "Bu görev birkaç gündür bekliyor. Hâlâ gerekli mi kontrol et.",
            taskText: task.text,
          });
        }
      });

    tasks
      .filter((task) => !task.completed && isLargeTask(task))
      .forEach((task) => {
        alerts.push({
          id: `large-${task.id}`,
          type: "info",
          category: task.category,
          title: "Büyük görev",
          message: "Bu görev büyük görünüyor. Daha küçük adımlara bölmeyi düşün.",
          taskText: task.text,
        });
      });

    return alerts;
  }, [tasks]);

  useEffect(() => {
    const todayKey = getLocalDateKey(new Date());
    const lastActiveDate = normalizeDateKey(
      localStorage.getItem(LAST_ACTIVE_DATE_KEY)
    );

    if (!lastActiveDate) {
      localStorage.setItem(LAST_ACTIVE_DATE_KEY, todayKey);
      return;
    }

    const hasCompletedTasksForActiveDate = tasks.some(
      (task) =>
        task.completed &&
        normalizeDateKey(task.completedAt) === lastActiveDate
    );
    const hasOpenDailyState =
      hasCompletedTasksForActiveDate || unfinishedTodayTasks.length > 0;

    if (lastActiveDate !== todayKey && hasOpenDailyState) {
      openCloseDayModal("auto");
      return;
    }

    if (lastActiveDate !== todayKey && !hasOpenDailyState) {
      localStorage.setItem(LAST_ACTIVE_DATE_KEY, todayKey);
    }
  }, [tasks, unfinishedTodayTasks.length]);

  return (
    <main className="app-shell">
      <Header
        onCloseDay={() => openCloseDayModal("manual")}
        onOpenHistory={openHistoryModal}
        onOpenSettings={openSettingsModal}
        onOpenNotifications={openNotificationsModal}
        notificationCount={notifications.length}
      />

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

      {isCloseDayModalOpen && (
        <CloseDayModal
          mode={closeDayMode}
          completedTasks={completedTasksForClosing}
          unfinishedTodayTasks={unfinishedTodayTasks}
          onClose={closeCloseDayModal}
          onMoveUnfinishedToBacklog={moveUnfinishedTodayTasksToBacklog}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal
          history={history}
          onClose={closeHistoryModal}
          onClearHistory={clearHistory}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          taskCount={tasks.length}
          completedCount={completedTasks.length}
          historyCount={history.length}
          onClose={closeSettingsModal}
          onClearAllTasks={clearAllTasksFromSettings}
          onClearCompletedTasks={clearCompletedTasksFromSettings}
          onClearHistory={clearHistory}
          onResetApp={resetApp}
          onExportData={exportData}
          onImportData={importData}
        />
      )}

      {isNotificationsModalOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={closeNotificationsModal}
        />
      )}
    </main>
  );
}

export default App;





