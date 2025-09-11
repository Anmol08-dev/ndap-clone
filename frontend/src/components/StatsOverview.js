 
// src/components/StatsOverview.js
import React from 'react';

const StatsOverview = ({ analytics }) => {
  const statsData = [
    {
      icon: '📊',
      title: 'Total Datasets',
      value: analytics.total_datasets || 0,
      description: 'Comprehensive government datasets'
    },
    {
      icon: '👀',
      title: 'Page Views',
      value: analytics.total_views || 0,
      description: 'User engagement across platform'
    },
    {
      icon: '⬇️',
      title: 'Downloads',
      value: analytics.total_downloads || 0,
      description: 'Dataset downloads by users'
    },
    {
      icon: '👥',
      title: 'Active Sessions',
      value: analytics.unique_sessions || 0,
      description: 'Unique user sessions'
    }
  ];

  return (
    <section className="platform-stats">
      <div className="container">
        <h2 className="section-title">Platform Overview</h2>
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value.toLocaleString()}</div>
                <div className="stat-desc">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsOverview;
