import React from 'react'

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-leaf">✦</span>
          <span className="brand-name">DermaCare</span>
          <p>Your skin, our science.</p>
        </div>
        <div className="footer-links">
          <h5>Treatments</h5>
          <a href="#">Skin Analysis</a>
          <a href="#">Hydration Therapy</a>
          <a href="#">Anti-Aging</a>
        </div>
        <div className="footer-links">
          <h5>Company</h5>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div className="footer-links">
          <h5>Contact</h5>
          <a href="#">hello@dermacare.com</a>
          <a href="#">+1 800 DERMA</a>
          <a href="#">Live Chat</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 DermaCare. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;