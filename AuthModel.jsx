// src/components/AuthModel.js
import { useState } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh",
  "Belgium","Brazil","Canada","Chile","China","Colombia","Croatia","Denmark",
  "Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","Hungary",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan",
  "Kenya","Malaysia","Mexico","Morocco","Myanmar","Nepal","Netherlands",
  "New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines","Poland",
  "Portugal","Romania","Russia","Saudi Arabia","Singapore","South Africa",
  "South Korea","Spain","Sri Lanka","Sweden","Switzerland","Tanzania","Thailand",
  "Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Vietnam","Zimbabwe"
];

function AuthModel({ mode, setMode, onClose }) {
  const [status, setStatus]   = useState({ msg: "", error: false });
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function handleLogin(e) {
    e.preventDefault();
    const email    = e.target["login-email"].value.trim();
    const password = e.target["login-password"].value;
    setLoading(true);
    setStatus({ msg: "Signing you in…", error: false });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus({ msg: "Welcome back! 🌿", error: false });
      setTimeout(onClose, 1200);
    } catch (err) {
      const msg = err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
        ? "Incorrect email or password." : err.message;
      setStatus({ msg, error: true });
    } finally { setLoading(false); }
  }

  async function handleSignup(e) {
    e.preventDefault();
    const name     = e.target["signup-name"].value.trim();
    const email    = e.target["signup-email"].value.trim();
    const password = e.target["signup-password"].value;
    const country  = e.target["signup-country"].value;
    if (!country) { setStatus({ msg: "Please select your country.", error: true }); return; }
    setLoading(true);
    setStatus({ msg: "Creating your account…", error: false });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), { name, email, country });
      setStatus({ msg: "Account created! Welcome 🌿", error: false });
      setTimeout(onClose, 1500);
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "Email already registered." : err.message;
      setStatus({ msg, error: true });
    } finally { setLoading(false); }
  }

  return (
    <>
      <div className="auth-overlay visible" onClick={onClose}></div>
      <div className="auth-card visible" data-mode={mode} onClick={e => e.stopPropagation()}>

        <button className="auth-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="auth-brand"><span className="brand-leaf">✦</span> DermaCare</div>

        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p>{isLogin ? "Sign in to your DermaCare account" : "Join DermaCare — your skin, our science"}</p>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${isLogin ? "active-toggle" : ""}`}
            onClick={() => { setMode("login"); setStatus({ msg: "", error: false }); }}
          >Log In</button>
          <button
            className={`toggle-btn ${!isLogin ? "active-toggle" : ""}`}
            onClick={() => { setMode("signup"); setStatus({ msg: "", error: false }); }}
          >Sign Up</button>
          <div className="toggle-slider"
            style={{ transform: isLogin ? "translateX(0)" : "translateX(100%)" }}>
          </div>
        </div>

        {status.msg && (
          <div className={`auth-status ${status.error ? "error" : "success"}`}>
            {status.msg}
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin && (
          <form className="auth-form" onSubmit={handleLogin} style={{ display: "flex" }}>
            <div className="field-wrap">
              <i className="fa-solid fa-envelope field-icon"></i>
              <input name="login-email" type="email" placeholder="Email address" required />
            </div>
            <div className="field-wrap">
              <i className="fa-solid fa-lock field-icon"></i>
              <input name="login-password" type="password" placeholder="Password" required />
            </div>
            <button type="submit" className="btn-solid full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <p className="auth-switch-text">
              Don't have an account?{" "}
              <a href="#" onClick={e => { e.preventDefault(); setMode("signup"); }}>Create one</a>
            </p>
          </form>
        )}

        {/* SIGNUP FORM */}
        {!isLogin && (
          <form className="auth-form" onSubmit={handleSignup} style={{ display: "flex" }}>
            <div className="field-wrap">
              <i className="fa-solid fa-user field-icon"></i>
              <input name="signup-name" type="text" placeholder="Full name" required />
            </div>
            <div className="field-wrap">
              <i className="fa-solid fa-envelope field-icon"></i>
              <input name="signup-email" type="email" placeholder="Email address" required />
            </div>
            <div className="field-wrap">
              <i className="fa-solid fa-lock field-icon"></i>
              <input name="signup-password" type="password" placeholder="Password (min 6)" required minLength={6} />
            </div>
            <div className="field-wrap">
              <i className="fa-solid fa-earth-asia field-icon"></i>
              <select name="signup-country" required>
                <option value="">— Select Country —</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-solid full" disabled={loading}>
              {loading ? "Creating…" : "Create Account"}
            </button>
            <p className="auth-switch-text">
              Already have an account?{" "}
              <a href="#" onClick={e => { e.preventDefault(); setMode("login"); }}>Sign in</a>
            </p>
          </form>
        )}

      </div>
    </>
  );
}

export default AuthModel;