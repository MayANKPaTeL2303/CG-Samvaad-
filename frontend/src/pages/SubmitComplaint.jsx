import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm';
import { complaintAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';

const SubmitComplaint = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);

    try {
      await complaintAPI.create(data);
      toast.success('Complaint submitted successfully!');
      navigate('/view-complaints');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit complaint. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-complaint-page">
      <div className="page-header">
        <h1>{t('submitComplaint')}</h1>
        <p>Fill in the details below to report a civic issue</p>
      </div>
      
      <ComplaintForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default SubmitComplaint;