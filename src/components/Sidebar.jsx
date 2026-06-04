function Sidebar({
  activeArea,
  setActiveArea,
  activeView,
  setActiveView,
  todayCount,
  backlogCount,
  completedCount,
  highPriorityTodayCount,
}) {
  return (
    <aside className="sidebar">
      <div className="area-switcher">
        <button
          className={activeArea === "work" ? "area-button active" : "area-button"}
          onClick={() => setActiveArea("work")}
        >
          İş
        </button>

        <button
          className={
            activeArea === "personal" ? "area-button active" : "area-button"
          }
          onClick={() => setActiveArea("personal")}
        >
          Kişisel
        </button>
      </div>

      <button
        className={activeView === "today" ? "nav-button active" : "nav-button"}
        onClick={() => setActiveView("today")}
      >
        <span>Today</span>
        <strong>{todayCount}</strong>
      </button>

      <button
        className={activeView === "backlog" ? "nav-button active" : "nav-button"}
        onClick={() => setActiveView("backlog")}
      >
        <span>Backlog</span>
        <strong>{backlogCount}</strong>
      </button>

      <div className="mini-card">
        <span>High Priority</span>
        <strong>{highPriorityTodayCount}</strong>
      </div>

      <div className="mini-card">
        <span>Completed</span>
        <strong>{completedCount}</strong>
      </div>
    </aside>
  );
}

export default Sidebar;
