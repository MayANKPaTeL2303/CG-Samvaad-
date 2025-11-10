import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    district: '',
    role: 'citizen',
  });
  const [loading, setLoading] = useState(false);

  const districts = [
    'Raipur', 'Bilaspur', 'Durg', 'Bhilai','Korba', 'Rajnandgaon', 'Raigarh',
    'Janjgir-Champa', 'Dhamtari', 'Mahasamund', 'Balod', 'Baloda Bazar',
    'Gariaband', 'Jashpur', 'Surguja', 'Surajpur', 'Balrampur', 'Korea',
    'Kanker', 'Kondagaon', 'Narayanpur', 'Bastar', 'Dantewada', 'Sukma',
    'Bijapur', 'Kabirdham', 'Mungeli', 'Bemetara', 'Gaurela-Pendra-Marwahi'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      toast.error("Passwords don't match!");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_id', response.data.user.id);
      
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            errorData[key].forEach(msg => toast.error(`${key}: ${msg}`));
          } else {
            toast.error(`${key}: ${errorData[key]}`);
          }
        });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('register')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="citizen">Citizen</option>
              <option value="officer">Officer</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Registering...' : t('register')}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;