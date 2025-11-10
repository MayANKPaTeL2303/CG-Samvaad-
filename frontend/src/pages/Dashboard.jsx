import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { analyticsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState([]);
  const [clusteringLoading, setClusteringLoading] = useState(false);

  const COLORS = ['#2c5f2d', '#17a2b8', '#ffc107', '#dc3545', '#6c757d', '#28a745', '#e83e8c', '#20c997'];

  useEffect(() => {
    fetchDashboardStats();
    fetchClusters();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchClusters = async () => {
    try {
      const response = await analyticsAPI.getClusters();
      setClusters(response.data);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    }
  };

  const runClustering = async (method = 'kmeans') => {
    setClusteringLoading(true);
    try {
      const response = await analyticsAPI.clusterComplaints({ method, n_clusters: 5 });
      setClusters(response.data.clusters);
      toast.success(`Successfully clustered ${response.data.total_complaints} complaints into ${response.data.total_clusters} groups`);
      await fetchClusters();
    } catch (error) {
      console.error('Error running clustering:', error);
      toast.error('Failed to run clustering');
    } finally {
      setClusteringLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="dashboard-error">Failed to load dashboard data</div>;
  }

  const categoryData = Object.entries(stats.category_distribution || {}).map(([key, value]) => ({
    name: t(key),
    value: value
  }));

  const statusData = Object.entries(stats.status_distribution || {}).map(([key, value]) => ({
    name: t(key.replace('_', '')),
    value: value,
    color: key === 'resolved' ? '#28a745' : key === 'pending' ? '#ffc107' : key === 'in_progress' ? '#17a2b8' : '#dc3545'
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Officer Dashboard</h1>
        <p>Real-time Analytics & Insights</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{stats.total_complaints}</h3>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{stats.pending_complaints}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{stats.in_progress_complaints}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{stats.resolved_complaints}</h3>
            <p>Resolved</p>
          </div>
        </div>

        <div className="stat-card time">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{stats.avg_resolution_time ? `${stats.avg_resolution_time}h` : 'N/A'}</h3>
            <p>Avg Resolution Time</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2c5f2d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Daily Complaints (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.daily_complaints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#2c5f2d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="clustering-section">
        <div className="section-header">
          <h2>AI-Powered Complaint Clustering</h2>
          <div className="clustering-actions">
            <button 
              onClick={() => runClustering('kmeans')} 
              disabled={clusteringLoading}
              className="btn-cluster"
            >
              {clusteringLoading ? 'Clustering...' : 'Run KMeans Clustering'}
            </button>
            {/* <button 
              onClick={() => runClustering('bertopic')} 
              disabled={clusteringLoading}
              className="btn-cluster secondary"
            >
              {clusteringLoading ? 'Clustering...' : 'Run BERTopic Clustering'}
            </button> */}
          </div>
        </div>

        {clusters.length > 0 ? (
          <div className="clusters-grid">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="cluster-card">
                <div className="cluster-header">
                  {/* <h4>Cluster {cluster.cluster_id}</h4> */}
                  <span className="cluster-count">{cluster.complaint_count} complaints</span>
                </div>
                <h5>{cluster.cluster_name}</h5>
                <div className="cluster-keywords">
                  {cluster.keywords.map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-clusters">
            <p>No clustering results yet. Click the button above to run AI clustering.</p>
          </div>
        )}
      </div>

      <div className="heatmap-section">
        <h2>Complaint Density Heatmap</h2>
        <div className="map-container-dashboard">
          <MapContainer
            center={[21.1938, 81.3509]}
            zoom={7}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {stats.complaint_heatmap && stats.complaint_heatmap.map((point, idx) => (
              <Marker 
                key={idx}
                position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
              >
                <Popup>
                  <div>
                    <strong>{t(point.category)}</strong>
                    <p>Count: {point.count}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="top-categories-section">
        <h2>Top Complaint Categories</h2>
        <div className="top-categories-list">
          {stats.top_categories && stats.top_categories.map((cat, idx) => (
            <div key={idx} className="category-item">
              <div className="category-rank">{idx + 1}</div>
              <div className="category-info">
                <h4>{t(cat.category)}</h4>
                <p>{cat.count} complaints</p>
              </div>
              <div className="category-bar">
                <div 
                  className="category-bar-fill" 
                  style={{ 
                    width: `${(cat.count / stats.total_complaints) * 100}%`,
                    backgroundColor: COLORS[idx % COLORS.length]
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;