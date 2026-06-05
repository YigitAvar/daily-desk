function Header({ onCloseDay, onOpenHistory, onOpenSettings }) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Daily Desk</p>
        <h1>Bugün neyi gerçekten bitireceksin?</h1>
        <p className="subtitle">
          Kağıttaki üstünü çizme hissini dijitale taşıyan sade görev paneli.
        </p>
      </div>

      <div className="hero-actions">
        <button className="history-button" onClick={onOpenSettings}>
          Ayarlar
        </button>

        <button className="history-button" onClick={onOpenHistory}>
          Geçmiş
        </button>

        <button className="close-day-button" onClick={onCloseDay}>
          Günü Kapat
        </button>
      </div>
    </section>
  );
}

export default Header;
