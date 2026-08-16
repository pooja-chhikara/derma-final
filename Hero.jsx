function Hero({ onAnalyse }) {
  return (
    <section className="hero" id="home">
      <span className="eyebrow">Science-Backed Skincare</span>
      <h1>
        Your Skin. <em>Our Science.</em>
      </h1>
      <p className="hero-sub">
        Get a free AI-powered skin analysis in seconds, then chat with our
        skincare assistant for a personalised routine — no appointment needed.
      </p>
      <div className="hero-actions">
        <button className="btn-solid large" onClick={onAnalyse}>
          <i className="fa-solid fa-microscope"></i> Start Free Skin Analysis
        </button>
        <a href="#treatments" className="btn-ghost large">
          View Treatments <i className="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>
  )
}

export default Hero
