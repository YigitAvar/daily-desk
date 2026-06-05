function NotificationsModal({ notifications, onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="close-day-modal notifications-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Smart Alerts</p>
            <h2>Bildirimler</h2>
            <p>Günün planını şişiren, bekleyen veya fazla büyük görünen görevler burada görünür.</p>
          </div>

          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="review-empty">
            Şu an önemli bir bildirim yok. Sistem temiz görünüyor.
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <article
                className={`notification-card ${notification.type}`}
                key={notification.id}
              >
                <div>
                  <span className="notification-label">
                    {notification.category === "work" ? "İş" : "Kişisel"}
                  </span>

                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>

                  {notification.taskText && (
                    <strong>{notification.taskText}</strong>
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
        </div>
      </section>
    </div>
  );
}

export default NotificationsModal;
