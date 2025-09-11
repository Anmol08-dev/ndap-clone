import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaRegBell, FaBell } from "react-icons/fa";
import NotificationPopup from "./NotificationPopup";

const DatasetGrid = ({ datasets, loading, onRefresh, user, onRequireLogin }) => {
  // Subscriptions for user
  const [subscriptions, setSubscriptions] = useState([]);
  // Notifications for user
  const [notifications, setNotifications] = useState([]);
  // Control popup visibility
  const [showNoti, setShowNoti] = useState(false);
  // Recent global activities for homepage (optional)
  const [recentActivities, setRecentActivities] = useState([]);

  // Navigation hook for redirecting on dataset click
  const navigate = useNavigate();

  // Fetch subscriptions and notifications when user changes
  useEffect(() => {
    if (!user || !user.id) {
      setSubscriptions([]);
      setNotifications([]);
      setShowNoti(false);
      return;
    }

    // Fetch user's subscriptions
    axios
      .get("/api/user/subscriptions", { headers: { "x-user-id": user.id } })
      .then((res) => setSubscriptions(res.data))
      .catch(() => setSubscriptions([]));

    // Fetch unseen notifications
    axios
      .get("/api/user/notifications", { headers: { "x-user-id": user.id } })
      .then((res) => {
        if (res.data?.length > 0) {
          setNotifications(res.data);
          setShowNoti(true);
        }
      });
  }, [user]);

  // Optional: Fetch global recent activities every 30 seconds
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get("/api/activity/logs");
        const logs = res.data.map((log) => ({
          id: log.time + log.type,
          type: log.type,
          dataset: log.dataset_title,
          user:
            log.session_id === "anonymous"
              ? "Anonymous User"
              : `User ${log.session_id.substring(0, 5)}`,
          time: new Date(log.time).toLocaleString(),
          icon: log.type === "download" ? "⬇️" : "👁️",
        }));
        setRecentActivities(logs);
      } catch {
        // silently fail
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Determine if dataset is subscribed
  const isSubscribed = (catId, dsId) =>
    !!subscriptions.find(
      (sub) =>
        Number(sub.category_id) === Number(catId) &&
        Number(sub.dataset_id) === Number(dsId)
    );

  // Toggle subscription for a dataset
  const handleSubscribe = async (dataset) => {
    if (!user || !user.id) {
      onRequireLogin && onRequireLogin();
      return;
    }
    const res = await axios.post(
      `/api/dataset/${dataset.id}/subscribe`,
      {},
      {
        headers: { "x-user-id": user.id },
      }
    );
    if (res.data.subscribed) {
      setSubscriptions((s) => [
        ...s,
        { category_id: dataset.category_id, dataset_id: dataset.id },
      ]);
    } else {
      setSubscriptions((s) =>
        s.filter(
          (sub) =>
            Number(sub.category_id) !== Number(dataset.category_id) ||
            Number(sub.dataset_id) !== Number(dataset.id)
        )
      );
    }
  };

  // Format file size human-readable
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle dataset view: log and navigate
  const handleView = async (id) => {
    if (!user || !user.id || !user.sessionId) {
      onRequireLogin && onRequireLogin();
      return;
    }
    try {
      await axios.post(
        `/api/dataset/${id}/view`,
        {},
        {
          headers: { "x-user-id": user.id, "x-session-id": user.sessionId },
        }
      );
      if (onRefresh) onRefresh();
      navigate(`/dataset/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle file download with filename preservation
  const handleDownload = async (id) => {
    if (!user || !user.id || !user.sessionId) {
      onRequireLogin && onRequireLogin();
      return;
    }
    try {
      const res = await axios.get(`/api/dataset/${id}/download`, {
        headers: { "x-user-id": user.id, "x-session-id": user.sessionId },
        responseType: "blob",
      });

      let filename = "download.csv";
      const disposition = res.headers["content-disposition"];
      if (disposition && disposition.indexOf("filename=") !== -1) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      if (onRefresh) onRefresh();
    } catch (error) {
      alert("Download failed. Please login and try again.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <section className="datasets-preview">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      {user && showNoti && notifications.length > 0 && (
        <NotificationPopup
          notifications={notifications}
          onClose={() => setShowNoti(false)}
        />
      )}

      <section className="datasets-preview">
        <div className="container">
          <h2 style={{
            fontWeight: "bold",
            fontSize: "2.1rem",
            textAlign: "center",
            marginBottom: "2.4rem",
            marginTop: "0.2rem",
            letterSpacing: "0.5px"
          }}>
            Datasets
          </h2>
          

          {datasets.length === 0 ? (
            <div className="no-results">
              <h3>No datasets found</h3>
              <p>Try adjusting your search or browse categories.</p>
            </div>
          ) : (
            <div className="datasets-grid">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="dataset-card">
                  <div className="dataset-header">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <h3
                        className="dataset-title"
                        onClick={() => handleView(dataset.id)}
                        style={{ cursor: "pointer", flex: 1, margin: 0, color: "#fff" }}
                      >
                        {dataset.title}
                      </h3>

                      {user && (
                        <span
                          onClick={() => handleSubscribe(dataset)}
                          className="bell-subscribe"
                          style={{ marginLeft: 12, cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center" }}
                          title={isSubscribed(dataset.category_id, dataset.id) ? "Unsubscribe" : "Subscribe"}
                        >
                          {isSubscribed(dataset.category_id, dataset.id) ? (
                            <FaBell color="#fff" className="bell-filled" />
                          ) : (
                            <FaRegBell color="#fff" className="bell-outline" />
                          )}
                        </span>
                      )}
                    </div>

                    <div className="dataset-category">{dataset.category_name}</div>
                  </div>

                  <div className="dataset-content">
                    <p className="dataset-description">
                      {dataset.description || dataset.summary || "No description available"}
                    </p>

                    <div className="dataset-meta">
                      <div className="meta-item">
                        <span className="meta-label">Source Organization</span>
                        <span className="meta-value">{dataset.source_organization || "Government of India"}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Coverage</span>
                        <span className="meta-value">{dataset.geographic_coverage || "National"}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Time Period</span>
                        <span className="meta-value">{dataset.temporal_coverage || "Various"}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">File Format</span>
                        <span className="meta-value">{dataset.file_type} • {formatFileSize(dataset.file_size)}</span>
                      </div>
                    </div>

                    <div className="dataset-stats">
                      <div className="stat-group">
                        <div className="stat-item-small">👁️ {dataset.view_count || 0} views</div>
                        <div className="stat-item-small">⬇️ {dataset.download_count || 0} downloads</div>
                      </div>

                      <button className="download-btn" onClick={() => handleDownload(dataset.id)}>Download</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default DatasetGrid;
