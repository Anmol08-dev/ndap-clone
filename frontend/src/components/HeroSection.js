import React, { useState } from 'react';
import axios from 'axios';
import SourceOrgChartModal from "./SourceOrgChartModal";

const HeroSection = ({ onSearch, analytics = {}, user }) => {
  const [searchInput, setSearchInput] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState({ ministries: [], sectors: [] });
  const [chartGroup, setChartGroup] = useState("ministries"); // "ministries" or "sectors"

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  // Handler to load org/sector chart on card click
  const handleShowDatasetOrgChart = async () => {
    try {
      const res = await axios.get("/api/activity/source-org-chart");
      setChartData({
        ministries: Array.isArray(res.data?.ministries) ? res.data.ministries : [],
        sectors: Array.isArray(res.data?.sectors) ? res.data.sectors : [],
      });
      setChartGroup("ministries");
      setShowChart(true);
    } catch (err) {
      alert("Failed to load chart data.");
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__content">
          {/* Only show title + subtitle before login */}
          {!user && (
            <>
              <h1 className="hero__title">Discover India's Data Universe</h1>
              <p className="hero__subtitle">
                The National Data & Analytics Platform provides seamless access to comprehensive datasets
                from across government ministries, departments, and agencies. Explore, analyze, and
                visualize India's official data to drive evidence-based decision making.
              </p>
            </>
          )}
          {/* Always show search bar */}
          <div className="hero__search">
            <form onSubmit={handleSearchSubmit} className="search-container">
              <input
                type="text"
                placeholder="Search for datasets, ministries, topics, or keywords..."
                className="main-search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="search-submit">Explore Data</button>
            </form>
          </div>
          {/* Always show stats */}
          <div className="hero__stats">
            {/* Make Total Datasets card clickable for chart popup */}
            <div
              className="stat-item"
              style={{ cursor: "pointer" }}
              onClick={handleShowDatasetOrgChart}
              title="Show datasets by ministry or sector"
            >
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-number">{(analytics.totalDatasets || 0).toLocaleString()}</span>
                <span className="stat-label">Total Datasets</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <span className="stat-number">{(analytics.totalCategories || 0).toLocaleString()}</span>
                <span className="stat-label">Total Ministries</span>
              </div>
            </div>
            {user && (
              <>
                <div className="stat-item">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-content">
                    <span className="stat-number">{(analytics.pageViews || 0).toLocaleString()}</span>
                    <span className="stat-label">Page Views</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">⬇️</div>
                  <div className="stat-content">
                    <span className="stat-number">{(analytics.downloads || 0).toLocaleString()}</span>
                    <span className="stat-label">Downloads</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Chart modal for Total Datasets with toggle */}
        {showChart && (
          <SourceOrgChartModal
            data={chartData}
            chartGroup={chartGroup}
            setChartGroup={setChartGroup}
            onClose={() => setShowChart(false)}
          />
        )}
      </div>
    </section>
  );
};

export default HeroSection;
