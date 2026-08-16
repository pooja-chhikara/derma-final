const TREATMENTS = [
  {icon:"fa-microscope", title:"Skin Analysis", description:"AI-powered + Dermatologist-reviewed full skin health report",tag:"diagnostic",featured:false},
  {icon:"fa-droplet", title:"Hydration Therapy", description:"AI-powered + Dermatologist-reviewed full skin health report",tag:"treatment",featured:false},
  {icon:"fa-star", title:"Anti-Aging", description:"AI-powered + Dermatologist-reviewed full skin health report",tag:"advanced",featured:false},
  {icon:"fa-shield-halved", title:"Barrier Repair", description:"AI-powered + Dermatologist-reviewed full skin health report",tag:"restore",featured:false},
  {icon:"fa-wand-magic-sparkles", title:"Brightening", description:"AI-powered + Dermatologist-reviewed full skin health report",tag:"glow",featured:false},
  {icon:"fa-user-doctor", title:"Expert Consultation", description:"AI-powered + Dermatologist-reviewed full skin health report",tag:"consult",featured:false}
]

function Treatments() {
  return (
    <section className="treatments" id='treatments'>
      <div className="section-header">
        <span className="eyebrow">What We Offer</span>
        <h2>Expert <em>Treatments</em></h2>
      </div>
      <div className="treatments-grid">
        {TREATMENTS.map(t => (
          <div key={t.title} className={`treatment-card ${t.featured ? "featured" : ""}`}>
            {t.featured && <div className="tc-badge">Most Popular</div>}
            <div className="tc-icon"><i className={`fa-solid ${t.icon}`}></i></div>
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <span className="tc-tag">{t.tag}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Treatments