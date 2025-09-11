import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';

const DatasetDetails = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Get dataset info
        const { data: ds } = await axios.get(`/api/dataset/${id}`);
        setDataset(ds);

        // 2. Get preview (first 10 rows)
        const { data: preview } = await axios.get(`/api/dataset/${id}/preview`);
        setHeaders(preview.headers || []);
        setRows(preview.rows || []);
      } catch {
        setDataset(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleDownload = async () => {
    try {
        // If you require user/session, get them (example using localStorage):
        const user = JSON.parse(localStorage.getItem("ndap_user") || "{}");
        if (!user || !user.id || !user.sessionId) {
        alert("Please login to download this dataset.");
        return;
        }

        const res = await axios.get(`/api/dataset/${id}/download`, {
        headers: {
            "x-user-id": user.id,
            "x-session-id": user.sessionId,
        },
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
    } catch (error) {
        alert("Download failed. Please login and try again.");
        console.error(error);
    }
};

  if (loading) return <div style={{ padding: 50 }}>Loading dataset...</div>;
  if (!dataset) return <div style={{ padding: 50 }}>Dataset not found.</div>;

  return (
    <div className="dataset-details-page" 
    style={{
        maxWidth: "90vw",
        width: "85vw",
        minWidth: 1000,
        margin: "40px auto 60px auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 24px #e0e0e096",
        padding: 40,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 30 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}>{dataset.title}</h1>
          <p style={{ margin: 0, fontSize: 17, color: "#444" }}>{dataset.description || dataset.summary || "No description available"}</p>
        </div>
        <button className="download-btn" onClick={handleDownload} style={{ height: 46, minWidth: 118, fontSize: 18, marginTop: 9 }}>Download</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 26, margin: "36px 0 16px 0" }}>
        <div><b>Source Organization:</b> <span style={{ color: "#2052a2" }}>{dataset.source_organization}</span></div>
        <div><b>Coverage:</b> {dataset.geographic_coverage}</div>
        <div><b>Time Period:</b> {dataset.temporal_coverage}</div>
        <div><b>File Format:</b> {dataset.file_type} &bull; {dataset.file_size && (dataset.file_size + " bytes")}</div>
      </div>
      <h3 style={{ margin: "15px 0 5px 0", fontWeight: 600 }}>Preview (First 10 Rows)</h3>
      <div style={{ overflowX: "auto", marginBottom: 25 }}>
        <table className="activity-table" style={{ minWidth: 500, margin: 0 }}>
          <thead>
            <tr>
              {headers.map((h, idx) => <th key={idx}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetDetails;
