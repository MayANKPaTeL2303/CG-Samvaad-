import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { complaintAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import './ComplaintDetail.css';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const userRole = localStorage.getItem('user_role') || 'citizen';

  useEffect(() => {
    fetchComplaintDetail();
    fetchComplaintUpdates();
  }, [id]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await complaintAPI.getById(id);
      setComplaint(response.data);
      if (response.data.rating) {
        setRating(response.data.rating);
        setFeedback(response.data.feedback || '');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Failed to load complaint details');
      navigate('/view-complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintUpdates = async () => {
    try {
      const response = await complaintAPI.getUpdates(id);
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await complaintAPI.update(id, { status: newStatus });
      toast.success('Status updated successfully');
      fetchComplaintDetail();
      fetchComplaintUpdates();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAssignToMe = async () => {
    try {
      await complaintAPI.assignToMe(id);
      toast.success('Complaint assigned to you');
      fetchComplaintDetail();
      fetchComplaintUpdates();
    } catch (error) {
      console.error('Error assigning complaint:', error);
      toast.error('Failed to assign complaint');
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintAPI.rateComplaint(id, { rating, feedback });
      toast.success('Thank you for your feedback!');
      setShowRatingModal(false);
      fetchComplaintDetail();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      in_progress: '#17a2b8',
      resolved: '#28a745',
      rejected: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="loading">Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div className="error">Complaint not found</div>;
  }

  return (
    <div className="complaint-detail">
      <div className="detail-header">
        <button onClick={() => navigate('/view-complaints')} className="btn-back">
          ← Back to List
        </button>
        <h1>Complaint Details</h1>
      </div>

      <div className="detail-container">
        <div className="detail-main">
          <div className="detail-card">
            <div className="card-header">
              <h2>{complaint.title}</h2>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(complaint.status) }}
              >
                {t(complaint.status.replace('_', ''))}
              </span>
            </div>

            <div className="detail-row">
              <strong>Category:</strong>
              <span>{t(complaint.category)}</span>
            </div>

            <div className="detail-row">
              <strong>Description:</strong>
              <p>{complaint.description}</p>
            </div>

            {complaint.address && (
              <div className="detail-row">
                <strong>Address:</strong>
                <span>{complaint.address}</span>
              </div>
            )}

            <div className="detail-row">
              <strong>Submitted by:</strong>
              <span>{complaint.citizen_details?.first_name} {complaint.citizen_details?.last_name}</span>
            </div>

            <div className="detail-row">
              <strong>Submitted on:</strong>
              <span>{new Date(complaint.created_at).toLocaleString('en-IN')}</span>
            </div>

            {complaint.assigned_officer_details && (
              <div className="detail-row">
                <strong>Assigned to:</strong>
                <span>{complaint.officer_details.first_name} {complaint.officer_details.last_name}</span>
              </div>
            )}

            {complaint.resolved_at && (
              <div className="detail-row">
                <strong>Resolved on:</strong>
                <span>{new Date(complaint.resolved_at).toLocaleString('en-IN')}</span>
              </div>
            )}

            {complaint.resolution_time && (
              <div className="detail-row">
                <strong>Resolution Time:</strong>
                <span>{complaint.resolution_time} hours</span>
              </div>
            )}

            {complaint.rating && (
              <div className="detail-row rating-display">
                <strong>Rating:</strong>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= complaint.rating ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}

            {complaint.feedback && (
              <div className="detail-row">
                <strong>Feedback:</strong>
                <p className="feedback-text">{complaint.feedback}</p>
              </div>
            )}
          </div>

          {complaint.image && (
            <div className="detail-card">
              <h3>Attached Image</h3>
              <img src={complaint.image} alt="Complaint" className="complaint-image" />
            </div>
          )}

          <div className="detail-card">
            <h3>Location</h3>
            <div className="map-container">
              <MapContainer
                center={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
                zoom={15}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]} />
              </MapContainer>
            </div>
            <p className="coordinates">
              Coordinates: {complaint.latitude}, {complaint.longitude}
            </p>
          </div>

          {updates.length > 0 && (
            <div className="detail-card">
              <h3>Update History</h3>
              <div className="timeline">
                {updates.map((update, index) => (
                  <div key={update.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <strong>{update.updated_by_name}</strong>
                        <span className="timeline-date">
                          {new Date(update.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p>
                        Changed status from <strong>{t(update.old_status.replace('_', ''))}</strong> to{' '}
                        <strong>{t(update.new_status.replace('_', ''))}</strong>
                      </p>
                      {update.comment && <p className="update-comment">{update.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          {/* <div className="actions-card"> */}
            {/* <h3>Actions</h3> */}
            {userRole === 'officer' && (
              <>
                {!complaint.assigned_officer && complaint.status === 'pending' && (
                  <button onClick={handleAssignToMe} className="btn-action primary">
                    Assign to Me
                  </button>
                )}

                {complaint.status === 'pending' && (
                  <button onClick={() => handleStatusUpdate('in_progress')} className="btn-action">
                    Mark In Progress
                  </button>
                )}

                {complaint.status === 'in_progress' && (
                  <>
                    <button onClick={() => handleStatusUpdate('resolved')} className="btn-action success">
                      Mark Resolved
                    </button>
                    <button onClick={() => handleStatusUpdate('rejected')} className="btn-action danger">
                      Reject
                    </button>
                  </>
                )}
              </>
            )}

            {userRole === 'citizen' && complaint.status === 'resolved' && !complaint.rating && (
              <button onClick={() => setShowRatingModal(true)} className="btn-action primary">
                Rate Resolution
              </button>
            )}

            {/* {complaint.status === 'pending' && userRole === 'citizen' && (
              <button onClick={() => navigate(`/edit-complaint/${id}`)} className="btn-action">
                Edit Complaint
              </button>
            )} */}
          {/* </div> */}

          <div className="info-card">
            <h4>Need Help?</h4>
            <p>If you have questions about this complaint, contact your local office.</p>
          </div>
        </div>
      </div>

      {showRatingModal && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Rate Resolution Quality</h2>
            <form onSubmit={handleRatingSubmit}>
              <div className="rating-input">
                <label>Rating:</label>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= rating ? 'star filled clickable' : 'star clickable'}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Feedback (Optional):</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">Submit Rating</button>
                <button type="button" onClick={() => setShowRatingModal(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;