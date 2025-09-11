import React from 'react';
import { Pie } from 'react-chartjs-2';

const chartColors = [
  "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099",
  "#0099c6", "#dd4477", "#6a8944", "#22aa99", "#aaaa11"
];

const makeChartData = (data = [], label) => ({
  labels: data.map(d => d.label),
  datasets: [
    {
      data: data.map(d => d.count),
      backgroundColor: chartColors.slice(0, data.length),
      label
    }
  ]
});

export default function SourceOrgChartModal({ data, chartGroup, setChartGroup, onClose }) {
  const currentData = Array.isArray(data?.[chartGroup]) ? data[chartGroup] : [];
  const groupLabel = chartGroup === "ministries" ? "Ministries" : "Sectors";

  if (!currentData.length) return null;

  return (
    <div className="chart-modal-backdrop" onClick={onClose}>
      <div className="chart-modal" onClick={e => e.stopPropagation()}>
        <div className="chart-modal-header">
          <span>Datasets by {groupLabel}</span>
          <button className="chart-close-btn" onClick={onClose}>×</button>
        </div>
        <div style={{ display: "flex", gap: "12px", padding: "16px" }}>
          <button
            className={`chart-toggle-btn${chartGroup === 'ministries' ? ' active' : ''}`}
            onClick={() => setChartGroup('ministries')}
          >
            Ministries
          </button>
          <button
            className={`chart-toggle-btn${chartGroup === 'sectors' ? ' active' : ''}`}
            onClick={() => setChartGroup('sectors')}
          >
            Sectors
          </button>
        </div>
        <div className="chart-holder">
          <Pie data={makeChartData(currentData, groupLabel)} />
        </div>
      </div>
    </div>
  );
}
