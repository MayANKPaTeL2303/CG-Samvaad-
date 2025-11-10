import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import ComplaintList from '../components/ComplaintList';
import { complaintAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import './ViewComplaints.css';

const ViewComplaints = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState('list'); 

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await complaintAPI.getAll(params);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleComplaintClick = (id) => {
    navigate(`/complaint/${id}`);
  };

  const categories = ['water', 'sanitation', 'roads', 'electricity', 'streetlight', 'drainage', 'garbage', 'other'];
  const statuses = ['Pending', 'In_progress', 'Resolved', 'Rejected'];

  return (
    <div className="view-complaints-page">
      <div className="page-header">
        <h1>{t('viewComplaints')}</h1>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <input
            type="text"
            name="search"
            placeholder="Search complaints..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />

          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{t(cat)}</option>
            ))}
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            {statuses.map(stat => (
              <option key={stat} value={stat}>{t(stat.replace('_', ''))}</option>
            ))}
          </select>

          <div className="view-toggle">
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={viewMode === 'map' ? 'active' : ''}
              onClick={() => setViewMode('map')}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading complaints...</div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <ComplaintList
              complaints={complaints}
              onComplaintClick={handleComplaintClick}
            />
          ) : (
            <div className="map-view">
              <MapContainer
                center={[21.1938, 81.3509]}
                zoom={7}
                style={{ height: '600px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {complaints.map((complaint) => (
                  <Marker
                    key={complaint.id}
                    position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h3>{complaint.title}</h3>
                        <p><strong>Category:</strong> {t(complaint.category)}</p>
                        <p><strong>Status:</strong> {t(complaint.status.replace('_', ''))}</p>
                        {complaint.address && <p><strong>Address:</strong> {complaint.address}</p>}
                        <button
                          onClick={() => handleComplaintClick(complaint.id)}
                          className="btn-view-details"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewComplaints;