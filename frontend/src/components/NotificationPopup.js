import React from "react";
import "./NotificationPopup.css";
import { FaTimes } from "react-icons/fa";

const NotificationPopup = ({ notifications, onClose }) => {
  return (
    <div className="notif-popup-backdrop" onClick={onClose}>
      <div className="notif-popup" onClick={e => e.stopPropagation()}>
        <div className="notif-popup-header">
          <span className="notif-popup-title">Notifications</span>
          <button className="notif-popup-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="notif-popup-body">
          {notifications && notifications.length === 0 ? (
            <div>No Notifications</div>
          ) : (
            notifications.map((n, idx) => (
              <div className="notif-popup-item" key={n.id || idx}>
                {n.message}
                <br />
                <span style={{ fontSize: 12, color: "#888" }}>
                  {n.created_at
                    ? new Date(n.created_at).toLocaleString()
                    : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;

