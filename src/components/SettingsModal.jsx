function SettingsModal({
  taskCount,
  completedCount,
  historyCount,
  onClose,
  onClearAllTasks,
  onClearCompletedTasks,
  onClearHistory,
  onResetApp,
}) {
  return (
    <div className="modal-backdrop">
      <section className="close-day-modal settings-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h2>Ayarlar</h2>
            <p>Verileri temizle, geçmişi yönet veya uygulamayı sıfırla.</p>
          </div>

          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-grid">
          <article className="settings-card">
            <div>
              <h3>Tüm Görevler</h3>
              <p>Today, Backlog ve çizilen görevlerin tamamını temizler.</p>
              <span>{taskCount} görev</span>
            </div>

            <button onClick={onClearAllTasks}>Görevleri Temizle</button>
          </article>

          <article className="settings-card">
            <div>
              <h3>Çizilen Görevler</h3>
              <p>Sadece tamamlanmış görevleri temizler. Aktif görevler kalır.</p>
              <span>{completedCount} çizilen</span>
            </div>

            <button onClick={onClearCompletedTasks}>Çizilenleri Temizle</button>
          </article>

          <article className="settings-card">
            <div>
              <h3>Geçmiş</h3>
              <p>Gün kapatma kayıtlarını temizler.</p>
              <span>{historyCount} kayıt</span>
            </div>

            <button onClick={onClearHistory}>Geçmişi Temizle</button>
          </article>

          <article className="settings-card danger-zone">
            <div>
              <h3>Uygulamayı Sıfırla</h3>
              <p>Tüm görevler, geçmiş ve günlük takip bilgisi silinir.</p>
              <span>Geri alınamaz</span>
            </div>

            <button onClick={onResetApp}>Tamamen Sıfırla</button>
          </article>
        </div>

        <div className="modal-actions">
          <button className="secondary-action" onClick={onClose}>
            Kapat
          </button>
        </div>
      </section>
    </div>
  );
}

export default SettingsModal;
