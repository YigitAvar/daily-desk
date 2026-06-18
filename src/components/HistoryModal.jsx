import { useMemo, useState } from "react";

const HEATMAP_WEEK_COUNT = 12;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getTaskAreaCounts(tasks = []) {
  return tasks.reduce(
    (counts, task) => {
      if (task.category === "work") {
        counts.work += 1;
      } else {
        counts.personal += 1;
      }

      return counts;
    },
    { work: 0, personal: 0 }
  );
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getHistoryDateKey(day) {
  const date = new Date(day.closedAt);
  return Number.isNaN(date.getTime()) ? null : getLocalDateKey(date);
}

function getContributionLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  return 4;
}

function buildHeatmap(history) {
  const completedByDate = history.reduce((counts, day) => {
    const dateKey = getHistoryDateKey(day);

    if (dateKey) {
      counts.set(
        dateKey,
        (counts.get(dateKey) || 0) + (day.completedTasks?.length || 0)
      );
    }

    return counts;
  }, new Map());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - today.getDay()));

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (HEATMAP_WEEK_COUNT * 7 - 1));

  return Array.from({ length: HEATMAP_WEEK_COUNT }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(
        startDate.getTime() + (weekIndex * 7 + dayIndex) * DAY_IN_MS
      );
      const dateKey = getLocalDateKey(date);
      const count = date > today ? 0 : completedByDate.get(dateKey) || 0;

      return {
        dateKey,
        count,
        level: getContributionLevel(count),
        isFuture: date > today,
        label: new Intl.DateTimeFormat("tr-TR", {
          day: "numeric",
          month: "short",
        }).format(date),
      };
    })
  );
}

function HistoryModal({ history, onClose, onClearHistory }) {
  const [expandedDayId, setExpandedDayId] = useState(null);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    return history.reduce(
      (totals, day) => {
        const completedTasks = day.completedTasks || [];
        const unfinishedTasks = day.unfinishedTasks || [];
        const completedCounts = getTaskAreaCounts(completedTasks);
        const closedAt = new Date(day.closedAt);
        const closedDay = new Date(closedAt);
        closedDay.setHours(0, 0, 0, 0);

        totals.completedTotal += completedTasks.length;
        totals.movedTotal += unfinishedTasks.length;
        totals.workCompleted += completedCounts.work;
        totals.personalCompleted += completedCounts.personal;

        if (!Number.isNaN(closedAt.getTime())) {
          if (closedDay.getTime() === today.getTime()) {
            totals.completedToday += completedTasks.length;
          }

          if (closedDay >= sevenDaysAgo && closedDay <= today) {
            totals.completedLastSevenDays += completedTasks.length;
          }
        }

        return totals;
      },
      {
        completedToday: 0,
        completedLastSevenDays: 0,
        completedTotal: 0,
        movedTotal: 0,
        workCompleted: 0,
        personalCompleted: 0,
      }
    );
  }, [history]);

  const heatmapWeeks = useMemo(() => buildHeatmap(history), [history]);

  function toggleDay(dayId) {
    setExpandedDayId((currentDayId) =>
      currentDayId === dayId ? null : dayId
    );
  }

  return (
    <div className="modal-backdrop">
      <section className="close-day-modal history-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Daily History</p>
            <h2>Geçmiş</h2>
            <p>İlerlemeyi gör, ayrıntıya yalnızca gerektiğinde in.</p>
          </div>

          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Geçmişi kapat"
          >
            ×
          </button>
        </div>

        <div className="history-summary-grid">
          <article className="history-summary-card today">
            <span>Bugün</span>
            <strong>{summary.completedToday}</strong>
            <p>tamamlanan görev</p>
          </article>

          <article className="history-summary-card success">
            <span>Son 7 Gün</span>
            <strong>{summary.completedLastSevenDays}</strong>
            <p>tamamlanan görev</p>
          </article>

          <article className="history-summary-card">
            <span>Tüm Zamanlar</span>
            <strong>{summary.completedTotal}</strong>
            <p>tamamlanan görev</p>
          </article>

          <article className="history-summary-card balance">
            <span>İş / Kişisel</span>
            <strong>
              {summary.workCompleted}
              <small>/</small>
              {summary.personalCompleted}
            </strong>
            <p>tamamlama dengesi</p>
          </article>
        </div>

        <section className="history-heatmap-panel">
          <div className="history-panel-heading">
            <div>
              <h3>12 haftalık ritim</h3>
              <p>Her kare, o gün tamamlanan görev yoğunluğunu gösterir.</p>
            </div>

            <div className="heatmap-legend" aria-label="Yoğunluk açıklaması">
              <span>Az</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <i key={level} className={`heatmap-cell level-${level}`} />
              ))}
              <span>Çok</span>
            </div>
          </div>

          <div className="history-heatmap-scroll">
            <div className="history-heatmap" aria-label="Tamamlanan görev heatmap'i">
              {heatmapWeeks.map((week, weekIndex) => (
                <div className="heatmap-week" key={weekIndex}>
                  {week.map((day) => (
                    <span
                      key={day.dateKey}
                      className={`heatmap-cell level-${day.level}${
                        day.isFuture ? " future" : ""
                      }`}
                      title={`${day.label}: ${day.count} tamamlanan görev`}
                      aria-label={`${day.label}: ${day.count} tamamlanan görev`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="history-feed-heading">
          <div>
            <h3>Gün özetleri</h3>
            <p>{history.length} kapanış kaydı</p>
          </div>
          <span>{summary.movedTotal} görev Backlog&apos;a taşındı</span>
        </div>

        {history.length === 0 ? (
          <div className="review-empty">Henüz günlük özet kaydı yok.</div>
        ) : (
          <div className="history-list compact-history-list">
            {history.map((day) => {
              const completedTasks = day.completedTasks || [];
              const unfinishedTasks = day.unfinishedTasks || [];
              const isExpanded = expandedDayId === day.id;
              const completedCounts = getTaskAreaCounts(completedTasks);
              const movedCounts = getTaskAreaCounts(unfinishedTasks);
              const completedTotal = completedTasks.length;
              const workShare =
                completedTotal > 0
                  ? (completedCounts.work / completedTotal) * 100
                  : 50;

              return (
                <article className="history-card compact-history-card" key={day.id}>
                  <div className="history-card-header">
                    <div>
                      <span className="history-date">{day.dateLabel}</span>
                      <p>{day.closedAtLabel} kapanışı</p>
                    </div>

                    <div className="history-stats">
                      <span className="completed-stat">
                        {completedTotal} tamamlandı
                      </span>
                      <span>{unfinishedTasks.length} taşındı</span>
                    </div>
                  </div>

                  <div className="history-balance-visual">
                    <div className="history-balance-labels">
                      <span>İş {completedCounts.work}</span>
                      <span>Kişisel {completedCounts.personal}</span>
                    </div>
                    <div
                      className="history-balance-bar"
                      aria-label={`${completedCounts.work} iş, ${completedCounts.personal} kişisel görev tamamlandı`}
                    >
                      <span
                        className="work-share"
                        style={{ width: `${workShare}%` }}
                      />
                      <span
                        className="personal-share"
                        style={{ width: `${100 - workShare}%` }}
                      />
                    </div>
                  </div>

                  <div className="history-card-footer">
                    <span>
                      İş: {movedCounts.work}, Kişisel: {movedCounts.personal} taşındı
                    </span>
                    <button
                      className="history-detail-toggle"
                      onClick={() => toggleDay(day.id)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Detayı kapat" : "Görevleri gör"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="history-details">
                      <div className="history-section">
                        <h3>Tamamlananlar</h3>

                        {completedTasks.length === 0 ? (
                          <p className="history-empty-text">Tamamlanan görev yok.</p>
                        ) : (
                          <ul>
                            {completedTasks.map((task) => (
                              <li key={task.id}>
                                <strong>
                                  {task.category === "work" ? "İş" : "Kişisel"}
                                </strong>
                                {task.text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="history-section">
                        <h3>Backlog&apos;a taşınanlar</h3>

                        {unfinishedTasks.length === 0 ? (
                          <p className="history-empty-text">Taşınan görev yok.</p>
                        ) : (
                          <ul>
                            {unfinishedTasks.map((task) => (
                              <li key={task.id}>
                                <strong>
                                  {task.category === "work" ? "İş" : "Kişisel"}
                                </strong>
                                {task.text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="modal-actions">
          <button className="secondary-action" onClick={onClose}>
            Kapat
          </button>

          <button
            className="danger-modal-action"
            onClick={onClearHistory}
            disabled={history.length === 0}
          >
            Geçmişi Temizle
          </button>
        </div>
      </section>
    </div>
  );
}

export default HistoryModal;
