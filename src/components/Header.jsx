function Header({ onCloseDay }) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Daily Desk</p>
        <h1>Bugün neyi gerçekten bitireceksin?</h1>
        <p className="subtitle">
          Kağıttaki üstünü çizme hissini dijitale taşıyan sade görev paneli.
        </p>
      </div>

      <button className="close-day-button" onClick={onCloseDay}>
        Günü Kapat
      </button>
    </section>
  );
}

export default Header;
