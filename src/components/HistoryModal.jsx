function HistoryModal({ history, onClose, onClearHistory }) {
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

        {history.length === 0 ? (
          <div className="review-empty">Henüz günlük özet kaydı yok.</div>
        ) : (
          <div className="history-list">
            {history.map((day) => (
              <article className="history-card" key={day.id}>
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

                <div className="history-section">
                  <h3>Tamamlananlar</h3>

                  {day.completedTasks.length === 0 ? (
                    <p className="history-empty-text">Tamamlanan görev yok.</p>
                  ) : (
                    <ul>
                      {day.completedTasks.map((task) => (
                        <li key={task.id}>
                          <strong>{task.category === "work" ? "İş" : "Kişisel"}</strong>
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
                          <strong>{task.category === "work" ? "İş" : "Kişisel"}</strong>
                          {task.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
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
