import React, { useMemo, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ChartModal = ({ title, rows, field = "dataset_name", onClose }) => {
  const aggregated = useMemo(() => {
    const m = new Map();
    rows.forEach(r => m.set(r[field] || "Unknown", (m.get(r[field] || "Unknown") || 0) + 1));
    const labels = Array.from(m.keys());
    const counts = labels.map(l => m.get(l));
    return { labels, counts };
  }, [rows, field]);

  const [type, setType] = useState("pie");

  const colors = useMemo(() => {
    const base = ["#1976d2","#43a047","#ef5350","#ffa726","#ab47bc","#26c6da","#8d6e63","#5c6bc0","#66bb6a","#ff7043"];
    return Array.from({length: aggregated.labels.length}, (_, i) => base[i % base.length]);
  }, [aggregated.labels]);

  const dataPie = { labels: aggregated.labels, datasets: [{ data: aggregated.counts, backgroundColor: colors }] };
  const dataBar = { labels: aggregated.labels, datasets: [{ data: aggregated.counts, backgroundColor: "#1976d2", borderRadius: 6 }] };

  return (
    <div className="chart-modal-backdrop" onClick={onClose}>
      <div className="chart-modal" onClick={(e)=>e.stopPropagation()}>
        <div className="chart-modal-header">
          <h3>{title}</h3>
          <button className="chart-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="chart-type-toggle">
          <button className={`chart-toggle-btn ${type==="pie" ? "active":""}`} onClick={()=>setType("pie")}>Pie</button>
          <button className={`chart-toggle-btn ${type==="bar" ? "active":""}`} onClick={()=>setType("bar")}>Bar</button>
        </div>

        <div className="chart-holder">
          {aggregated.labels.length === 0 ? (
            <div style={{textAlign:"center", color:"#666"}}>No data to display</div>
          ) : type === "pie" ? (
            <Pie data={dataPie} />
          ) : (
            <Bar data={dataBar} options={{ plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 } } } }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
