import React, { useState, useEffect } from "react";
import axios from "axios";
import ChartModal from "./ChartModal"; 


const formatDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ActivityTables = ({ user }) => {
  const [views, setViews] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showViewsChart, setShowViewsChart] = useState(false);
  const [showDownloadsChart, setShowDownloadsChart] = useState(false);

  const handleRowDownload = async (id) => {
  try {
    if (!user || !user.id || !user.sessionId) return;
    const response = await axios.get(`/api/dataset/${id}/download`, {
      headers: { 'x-user-id': user.id, 'x-session-id': user.sessionId },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dataset-${id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert("Download failed.");
  }
  };


  useEffect(() => {
  const fetchActivity = async () => {
    if (!user || !user.id || !user.sessionId) {
      setViews([]);
      setDownloads([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const headers = {
        "x-user-id": user.id,
        "x-session-id": user.sessionId,
      };
      const [viewsRes, downloadsRes] = await Promise.all([
        axios.get("/api/activity/my-views", { headers }),
        axios.get("/api/activity/my-downloads", { headers }),
      ]);
      setViews(viewsRes.data || []);
      setDownloads(downloadsRes.data || []);
    } catch (e) {
      setViews([]);
      setDownloads([]);
    } finally {
      setLoading(false);
    }
  };

  fetchActivity();
  }, [user]);

  if (!user) {
    return (
      <section className="activity-tables">
        <div className="container">
          <h2 style={{ textAlign: "center", fontWeight: "bold", margin: "2rem 0" }}>
            Recent Activity
          </h2>
          <div style={{ textAlign: "center", color: "#444", margin: "1.2rem 0 2rem" }}>
            Please login to see your Recent Activity.
          </div>
        </div>
      </section>
    );
  }

  if (loading) return <div>Loading activity data...</div>;
  console.log("Views:", views);
  console.log("Downloads:", downloads);


  return (
    <section className="activity-tables">
      <div className="container">
        <h2 style={{ textAlign: "center", fontWeight: "bold", margin: "2rem 0" }}>
          Recent Activity
        </h2>

        {/* Dataset Views */}
        <h3 style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "1rem 0"
        }}>
          <span>Dataset Views</span>
          <button className="nav-button" onClick={() => setShowViewsChart(true)} style={{ height: 36, padding: "0 14px" }}>
            View Charts
          </button>
        </h3>
        <div className="scrollable-table-container">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Dataset ID</th>
                <th>Session ID</th>
                <th>Dataset Name</th>
                <th>View Type</th>
                <th>Viewed At</th>
              </tr>
            </thead>
            <tbody>
              {views.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#888" }}>
                    No recorded views.
                  </td>
                </tr>
              ) : (
                views.map((row) => (
                  <tr key={row.id}>
                    <td>{row.dataset_id}</td>
                    <td>{row.session_id}</td>
                    <td>{row.dataset_name}</td>
                    <td>{row.view_type}</td>
                    <td>{formatDate(row.viewed_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dataset Downloads */}
        <h3 style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "1.5rem 0 1rem"
        }}>
          <span>Dataset Downloads</span>
          <button className="nav-button" onClick={() => setShowDownloadsChart(true)} style={{ height: 36, padding: "0 14px" }}>
            View Charts
          </button>
        </h3>
        <div className="scrollable-table-container">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Dataset ID</th>
                <th>Session ID</th>
                <th>Dataset Name</th>
                <th>Requested At</th>
                <th>Completed At</th>
                <th>Download</th> {/* new column */}
              </tr>
            </thead>

            <tbody>
              {downloads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#888" }}>
                    No recorded downloads.
                  </td>
                </tr>
              ) : (
                downloads.map((row) => (
                  <tr key={row.id}>
                    <td>{row.dataset_id}</td>
                    <td>{row.session_id}</td>
                    <td>{row.dataset_name}</td>
                    <td>{formatDate(row.requested_at)}</td>
                    <td>{formatDate(row.completed_at)}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="download-row-btn"
                        title="Download this dataset"
                        onClick={() => handleRowDownload(row.dataset_id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      >
                        <img
    src="/progress-download.svg"
    alt="Download"
    style={{ width: 20, height: 20, display : 'block' }}
  />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>


          </table>
        </div>

        {showViewsChart && (
          <ChartModal
            title="Views by Dataset"
            rows={views}
            field="dataset_name"
            onClose={() => setShowViewsChart(false)}
          />
        )}

        {showDownloadsChart && (
          <ChartModal
            title="Downloads by Dataset"
            rows={downloads}
            field="dataset_name"
            onClose={() => setShowDownloadsChart(false)}
          />
        )}
      </div>
    </section>
  );
};

export default ActivityTables;
