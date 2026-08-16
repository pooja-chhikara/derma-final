import React from 'react'
import { useAuth } from "../context/AuthContext";

function UserPanel() {
  const { user, profile } = useAuth();
  if (!user) return null;

  return (
    <div className="user-panel">
      <div className="user-panel-inner">
        <div className="user-avatar-lg">
          <i className="fa-solid fa-user"></i>
        </div>
        <div className="user-details">
          <h3>{profile?.name || "User"}</h3>
          <p><i className="fa-solid fa-envelope"></i> {profile?.email || user.email}</p>
          <p><i className="fa-solid fa-earth-asia"></i> {profile?.country || "—"}</p>
        </div>
        <div className="user-welcome">
          <span>Welcome back to DermaCare 🌿</span>
          <p>Your personalised skin journal is ready.</p>
        </div>
      </div>
    </div>
  );
}

export default UserPanel;