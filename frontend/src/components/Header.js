import React, { useState } from "react";
import "./Sidebar.css";

const Header = ({ onAuthOpen, onLogout, user }) => {
  const [open, setOpen] = useState(false);

  // Scroll to a specific section by ID
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setOpen(false); // Optionally close sidebar after navigation
  };

  return (
    <>
      {/* Hamburger icon to toggle sidebar */}
      <div className="sidebar-hamburger" onClick={() => setOpen((o) => !o)}>
        ☰
      </div>

      {/* Overlay for closing sidebar by clicking outside */}
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar navigation */}
      <nav className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-hamburger"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
          <div className="sidebar-logo-centered">
            <span style={{ fontWeight: "bold", fontSize: 20 }}>NDAP</span>
          </div>
          <button className="sidebar-close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <ul className="sidebar-list">
          <li>
            <button
              className="sidebar-link"
              onClick={() => scrollToId("datasets-section")}
            >
              📊 Datasets
            </button>
          </li>
          <li>
            <button
              className="sidebar-link"
              onClick={() => scrollToId("recent-activity")}
            >
              🕑 Recent Activity
            </button>
          </li>
          <li>
            <button
              className="sidebar-link"
              onClick={() =>
                alert("Language switching coming soon!")
              }
            >
              🌐 English
            </button>
          </li>
        </ul>

        <div className="sidebar-auth">
          {user ? (
            <>
              <span className="sidebar-username">👤 {user.username}</span>
              <button onClick={onLogout} className="sidebar-link">
                Logout
              </button>
            </>
          ) : (
            <button onClick={onAuthOpen} className="sidebar-link">
              Login / Signup
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
