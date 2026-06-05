import { useMemo, useState } from "react";

function getTaskAreaCounts(tasks) {
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

function getLastSevenDays(history) {
  return history.slice(0, 7);
}

function HistoryModal({ history, onClose, onClearHistory }) {
  const [expandedDayId, setExpandedDayId] = useState(null);

  const lastSevenDays = useMemo(() => getLastSevenDays(history), [history]);

  const summary = useMemo(() => {
    const completedTotal = lastSevenDays.reduce(
      (total, day) => total + day.completedTasks.length,
      0
    );

    const movedTotal = lastSevenDays.reduce(
      (total, day) => total + day.unfinishedTasks.length,
      0
    );

    const allCompletedTasks = lastSevenDays.flatMap((day) => day.completedTasks);
    const completedAreaCounts = getTaskAreaCounts(allCompletedTasks);

    return {
      completedTotal,
      movedTotal,
      workCompleted: completedAreaCounts.work,
      personalCompleted: completedAreaCounts.personal,
    };
  }, [lastSevenDays]);

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
            <p>Kapatılan günlerin kısa özetleri burada tutulur.</p>
          </div>

          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="history-summary-grid">
          <article className="history-summary-card">
            <span>Son 7 Gün</span>
            <strong>{lastSevenDays.length}</strong>
            <p>kayıt</p>
          </article>

          <article className="history-summary-card success">
            <span>Tamamlanan</span>
            <strong>{summary.completedTotal}</strong>
            <p>görev</p>
          </article>

          <article className="history-summary-card warning">
            <span>Taşınan</span>
            <strong>{summary.movedTotal}</strong>
            <p>Backlog</p>
          </article>

          <article className="history-summary-card balance">
            <span>Denge</span>
            <strong>{summary.workCompleted}/{summary.personalCompleted}</strong>
            <p>İş / Kişisel</p>
          </article>
        </div>

        {history.length === 0 ? (
          <div className="review-empty">Henüz günlük özet kaydı yok.</div>
        ) : (
          <div className="history-list compact-history-list">
            {history.map((day) => {
              const isExpanded = expandedDayId === day.id;
              const completedCounts = getTaskAreaCounts(day.completedTasks);
              const movedCounts = getTaskAreaCounts(day.unfinishedTasks);

              return (
                <article className="history-card compact-history-card" key={day.id}>
                  <div className="history-card-header">
                    <div>
                      <span className="history-date">{day.dateLabel}</span>
                      <p>{day.closedAtLabel}</p>
                    </div>

                    <div className="history-stats">
                      <span>{day.completedTasks.length} tamamlanan</span>
                      <span>{day.unfinishedTasks.length} taşınan</span>
                    </div>
                  </div>

                  <div className="history-balance-row">
                    <div>
                      <span>İş</span>
                      <strong>
                        {completedCounts.work} tamamlanan / {movedCounts.work} taşınan
                      </strong>
                    </div>

                    <div>
                      <span>Kişisel</span>
                      <strong>
                        {completedCounts.personal} tamamlanan / {movedCounts.personal} taşınan
                      </strong>
                    </div>
                  </div>

                  <button
                    className="history-detail-toggle"
                    onClick={() => toggleDay(day.id)}
                  >
                    {isExpanded ? "Detayı Kapat" : "Detayı Aç"}
                  </button>

                  {isExpanded && (
                    <div className="history-details">
                      <div className="history-section">
                        <h3>Tamamlananlar</h3>

                        {day.completedTasks.length === 0 ? (
                          <p className="history-empty-text">Tamamlanan görev yok.</p>
                        ) : (
                          <ul>
                            {day.completedTasks.map((task) => (
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
                        <h3>Backlog'a Taşınanlar</h3>

                        {day.unfinishedTasks.length === 0 ? (
                          <p className="history-empty-text">Taşınan görev yok.</p>
                        ) : (
                          <ul>
                            {day.unfinishedTasks.map((task) => (
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
