import React from 'react'
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar({ openAuth }) {
  const { user, profile, logOut } = useAuth();
  const [menuOpen, setMenuOpen]   = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-leaf">✦</span>
        <span className="brand-name">DermaCare</span>
      </div>

      <ul className={`nav-link ${menuOpen ? "open" : ""}`}>
        <li><a href="#home"       onClick={() => setMenuOpen(false)}>Home</a></li>
        <li><a href="#treatments" onClick={() => setMenuOpen(false)}>Treatments</a></li>
        <li><a href="#about"      onClick={() => setMenuOpen(false)}>About</a></li>
        <li><a href="#contact"    onClick={() => setMenuOpen(false)}>Contact</a></li>
      </ul>

      <div className="nav-actions">
        {user ? (
          <div className="nav-user">
            <div className="nav-avatar">
              <i className="fa-solid fa-user-circle"></i>
            </div>
            <span>{profile?.name || "User"}</span>
            <button className="btn-ghost small" onClick={logOut}>Logout</button>
          </div>
        ) : (
          <div className="nav-auth-btns">
            <button className="btn-ghost" onClick={() => openAuth("login")}>Log In</button>
            <button className="btn-solid" onClick={() => openAuth("signup")}>Get Started</button>
          </div>
        )}
      </div>

      <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)}>
        <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
      </button>
    </nav>
  );
}

export default Navbar;