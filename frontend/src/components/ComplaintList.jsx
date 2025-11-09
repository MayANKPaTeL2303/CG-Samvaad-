import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ComplaintList.css';

const ComplaintList = ({ complaints, onComplaintClick }) => {
  const { t } = useLanguage();

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      in_progress: 'status-progress',
      resolved: 'status-resolved',
      rejected: 'status-rejected',
    };
    return statusClasses[status] || '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (complaints.length === 0) {
    return (
      <div className="no-complaints">
        <p>No complaints found.</p>
      </div>
    );
  }

  return (
    <div className="complaint-list">
      {complaints.map((complaint) => (
        <div
          key={complaint.id}
          className="complaint-card"
          onClick={() => onComplaintClick(complaint.id)}
        >
          <div className="complaint-header">
            <h3>{complaint.title}</h3>
            <span className={`status-badge ${getStatusClass(complaint.status)}`}>
              {t(complaint.status.replace('_', ''))}
            </span>
          </div>
          
          <div className="complaint-info">
            <div className="info-item">
              <span className="label">{t('category')}:</span>
              <span className="value">{t(complaint.category)}</span>
            </div>
            
            {complaint.address && (
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">{complaint.address}</span>
              </div>
            )}
            
            {complaint.citizen_name && (
              <div className="info-item">
                <span className="label">Citizen:</span>
                <span className="value">{complaint.citizen_name}</span>
              </div>
            )}
            
            <div className="info-item">
              <span className="label">Date:</span>
              <span className="value">{formatDate(complaint.created_at)}</span>
            </div>
          </div>
          
          <div className="complaint-footer">
            <span className="location-tag">
             Lat,Long:  {Number(complaint.latitude).toFixed(4)}, {Number(complaint.longitude).toFixed(4)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintList;