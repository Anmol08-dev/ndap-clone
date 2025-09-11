import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import DatasetGrid from "./components/DatasetGrid";
import ActivityTables from "./components/ActivityTables";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import DatasetDetails from './pages/DatasetDetails';

import "./App.css";


function App() {
  const [datasets, setDatasets] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Changed to store entire user object including id and sessionId
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("ndap_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [showAuth, setShowAuth] = useState(false);

  const openAuth = () => setShowAuth(true);
  const closeAuth = () => setShowAuth(false);

  // On successful login/signup, store full user object
  const handleLoggedIn = (userData) => {
    setUser(userData);
    localStorage.setItem("ndap_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("ndap_user");
  };

  const fetchAnalytics = async () => {
    try {
      const headers = {};
      if (user && user.id) {
        // Pass user ID and sessionId headers for personalized analytics
        headers['x-user-id'] = user.id;
        if (user.sessionId) {
          headers['x-session-id'] = user.sessionId;
        }
      }
      const res = await axios.get("/api/activity/summary", { headers });
      setAnalytics({
        totalDatasets: res.data.datasets,
        totalCategories: res.data.categories,
        totalUsers: res.data.uniqueUsers,
        pageViews: res.data.pageViews,
        downloads: res.data.downloads,
      });
    } catch (error) {
      setAnalytics({
        totalDatasets: 0,
        totalCategories: 0,
        totalUsers: 0,
        pageViews: 0,
        downloads: 0,
      });
    }
  };

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      const headers = {};
      if (user && user.id) {
        headers['x-user-id'] = user.id;
        if (user.sessionId) {
          headers['x-session-id'] = user.sessionId;
        }
      }
      const res = await axios.get("/api/datasets", { params, headers });
      setDatasets(res.data);
    } catch {
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalytics();
    fetchDatasets();
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line
  }, [searchTerm, user]);

  const handleSearch = (term) => setSearchTerm(term);

  // Main app with routing
  return (
    <Router>
      <div className="App">
        <Header onAuthOpen={openAuth} onLogout={handleLogout} user={user} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection analytics={analytics} onSearch={handleSearch} user={user} />
                <div id="datasets-section">
                  <DatasetGrid
                    datasets={datasets}
                    loading={loading}
                    onRefresh={refreshData}
                    user={user}
                    onRequireLogin={openAuth}
                  />
                </div>
                <div id="recent-activity">
                  <ActivityTables user={user} />
                </div>
                <Footer />
              </>
            }
          />
          <Route path="/dataset/:id" element={<DatasetDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {showAuth && <AuthModal onClose={closeAuth} onLoggedIn={handleLoggedIn} />}
      </div>
    </Router>
  );
}

export default App;
