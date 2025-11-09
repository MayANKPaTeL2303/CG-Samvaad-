import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const Home = () => {
  const { t } = useLanguage();
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title gradient-text">{t('appName')}</h1>
          <p className="hero-subtitle">
            Citizen Grievance & Suggestion Platform for Chhattisgarh
          </p>
          <p className="hero-description">
            Report civic issues, track progress, and collaborate for a better Chhattisgarh.
          </p>

          <div className="cta-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline">
                  {t('login')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/submit-complaint" className="btn btn-primary">
                  {t('submitComplaint')}
                </Link>
                <Link to="/view-complaints" className="btn btn-outline">
                  {t('viewComplaints')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Geotagged Complaints</h3>
            <p>Submit issues with exact locations using OpenStreetMap integration.</p>
          </div>

          <div className="feature-card">
            <h3>Track Progress</h3>
            <p>Stay updated on your complaint status in real-time.</p>
          </div>

          <div className="feature-card">
            <h3>Rate & Feedback</h3>
            <p>Provide ratings and feedback once your issue is resolved.</p>
          </div>

          <div className="feature-card">
            <h3>Multilingual Interface</h3>
            <p>Available in Hindi, Chhattisgarhi, and English for inclusivity.</p>
          </div>

          <div className="feature-card">
            <h3>AI-Powered Grouping</h3>
            <p>Automatically cluster similar complaints for faster resolution.</p>
          </div>

          <div className="feature-card">
            <h3>Analytics Dashboard</h3>
            <p>Visualize trends and civic performance through data insights.</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Report Issues About</h2>
        <div className="categories-list">
          {[
            t('water'),
            t('sanitation'),
            t('roads'),
            t('electricity'),
            t('streetlight'),
            t('drainage'),
            t('garbage'),
            t('other'),
          ].map((category, idx) => (
            <div key={idx} className="category-item">
              {category}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
