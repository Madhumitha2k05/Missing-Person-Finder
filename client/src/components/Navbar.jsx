// File: client/src/components/Navbar.jsx

import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css'; // Make sure styles are imported

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Consider redirecting before alerting for better UX
    navigate('/login');
    alert('You have been logged out.');
  };

  return (
    <nav className="navbar">
      {/* --- Brand Link - Ensured text is clean --- */}
      <Link to="/" className="navbar-brand">Missing Person Finder</Link>

      {/* --- Navigation Links --- */}
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/found">Found Persons</Link>

        {token ? (
          // --- Logged-in links ---
          <>
            <Link to="/create-report">Report Missing</Link>
            <Link to="/my-reports" className="profile-link">
              {/* Adjusted icon styling slightly for better alignment */}
              <FaUserCircle size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              <span>My Reports</span>
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          // --- Logged-out links ---
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;