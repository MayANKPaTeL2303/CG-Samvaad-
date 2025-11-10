import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role') || 'citizen'

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Chhattisgarh_districts_map.svg/50px-Chhattisgarh_districts_map.svg.png" alt=""/>
        <Link to="/" className="navbar-logo" >
          {t('appName')}
        </Link>


        <div className="navbar-menu">
          <Link to="/" className="navbar-link">{t('home')}</Link>
          
          {isAuthenticated && (
            <>
            {userRole === 'citizen' &&
              <Link to="/submit-complaint" className="navbar-link">
                {t('submitComplaint')}
              </Link>
            }
              
              <Link to="/view-complaints" className="navbar-link">
                {t('viewComplaints')}
              </Link>
              {userRole === 'officer' && (
                <Link to="/dashboard" className="navbar-link">
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="navbar-link">
                {t('profile')}
              </Link>
              <button onClick={handleLogout} className="navbar-link btn-logout">
                {t('logout')}
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="navbar-link">{t('login')}</Link>
              <Link to="/register" className="navbar-link">{t('register')}</Link>
            </>
          )}

          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="cg">छत्तीसगढ़ी</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;