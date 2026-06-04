function CloseDayModal({
  mode = "manual",
  completedTasks,
  unfinishedTodayTasks,
  onClose,
  onMoveUnfinishedToBacklog,
}) {
  const completedCount = completedTasks.length;
  const unfinishedCount = unfinishedTodayTasks.length;
  const isAutoMode = mode === "auto";
  const hasUnfinishedTasks = unfinishedCount > 0;

  return (
    <div className="modal-backdrop">
      <section className="close-day-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {isAutoMode ? "New Day Detected" : "Daily Review"}
            </p>
            <h2>{isAutoMode ? "Dünden Kalanlar Var" : "Günü Kapat"}</h2>
            <p>
              {isAutoMode
                ? "Yeni gün başladı. Dünden kalan Today görevlerini gözden geçirip günü kaydedebilirsin."
                : "Bugünün durumunu gör, tamamlananları kaydet ve gerekiyorsa bitmeyenleri Backlog'a taşı."}
            </p>
          </div>

          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="review-grid">
          <article className="review-card success">
            <span>Tamamlanan</span>
            <strong>{completedCount}</strong>
          </article>

          <article className="review-card warning">
            <span>Bitmeyen</span>
            <strong>{unfinishedCount}</strong>
          </article>
        </div>

        <div className="review-section">
          <div className="review-section-title">
            <h3>Tamamlananlar</h3>
            <span>{completedCount}</span>
          </div>

          {completedCount === 0 ? (
            <div className="review-empty">Bugün çizilen görev yok.</div>
          ) : (
            <div className="review-task-list">
              {completedTasks.map((task) => (
                <div className="review-task completed-review-task" key={task.id}>
                  <span>{task.category === "work" ? "İş" : "Kişisel"}</span>
                  <p>{task.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="review-section">
          <div className="review-section-title">
            <h3>Bitmeyen Today Görevleri</h3>
            <span>{unfinishedCount}</span>
          </div>

          {unfinishedCount === 0 ? (
            <div className="review-empty">
              Açık Today görevi kalmadı. Günü direkt kaydedebilirsin.
            </div>
          ) : (
            <div className="review-task-list">
              {unfinishedTodayTasks.map((task) => (
                <div className="review-task" key={task.id}>
                  <span>{task.category === "work" ? "İş" : "Kişisel"}</span>
                  <p>{task.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary-action" onClick={onClose}>
            {isAutoMode ? "Şimdilik Kalsın" : "Vazgeç"}
          </button>

          <button className="primary-action" onClick={onMoveUnfinishedToBacklog}>
            {hasUnfinishedTasks
              ? "Backlog'a Taşı ve Günü Kaydet"
              : "Günü Kaydet"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default CloseDayModal;
