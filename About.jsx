import React from 'react'

function About() {
  return (
    <section id = "about" className = "about">
      <div className = "about-inner">
        <div className = "about-text">
          <span className = "about-charm">
            Our Philosophy
          </span>
          <h2>
            Skin Health is <em>Personal</em> //bold
          </h2>
          <p>At DermaCare, we believe every skin tells a different story. Our approach combines the precision of clinical dermatology with the warmth of personalised care.</p>
          <div className = "about-pillar">
            <div className = "pillar">
            <i className= "fa-solid fa-atom"></i>
            <span>Evidence Based</span>
            </div>
            <div className = "pillar">
            <i className= "fa-solid fa-heart-pulse"></i>
            <span>Personalized</span>
            </div>
            <div className = "pillar">
            <i className= "fa-solid fa-seedling"></i>
            <span>Sustainable</span>
            </div>
          </div>
          <div className = "about-visual">
            {[
              {num:"01",title:"Consult", description:"Meet your skin expert virtually"},
              {num:"02",title:"Diagnose", description:"Get a full skin health analysis"},
              {num:"03",title:"Treat", description:"Follow your personalized care plan"}
            ].map(value=>(
              <div key={value.num} className = "about-card">
                <div className = "about-number">{value.num}</div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About