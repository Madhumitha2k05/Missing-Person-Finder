// File: client/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; 

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Function to determine exact login status and admin roles
  const getAuthStatus = () => {
    if (!token) return { isLoggedIn: false, isAdmin: false };
    
    // 🔥 ✅ Explicitly check for our Master Admin Override token
    if (token === 'fake-admin-token-override') {
      return { isLoggedIn: true, isAdmin: true };
    }

    try {
      // Decode standard user database tokens
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      return { 
        isLoggedIn: true, 
        isAdmin: payload.user?.isAdmin || payload.isAdmin || false 
      };
    } catch (e) {
      return { isLoggedIn: false, isAdmin: false };
    }
  };

  const { isLoggedIn, isAdmin } = getAuthStatus();

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ backgroundColor: '#121212', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
      <div className="navbar-brand">
        <Link to="/" style={{ color: '#bb86fc', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
          🔍 Missing Person Finder
        </Link>
      </div>

      <div className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/found" style={{ color: '#fff', textDecoration: 'none' }}>Found Persons</Link>

        {isLoggedIn ? (
          <>
            {/* 🌟 HIDE USER LINKS IF THE LOGGED-IN ACCOUNT IS AN ADMIN */}
            {!isAdmin && (
              <>
                <Link to="/create-report" style={{ color: '#fff', textDecoration: 'none' }}>Report Missing</Link>
                {/* Removed 'My Reports' since it is now inside the Profile page! */}
                <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Profile</Link>
              </>
            )}

            {isAdmin && (
              <Link 
                to="/admin" 
                style={{ 
                  color: '#03dac6', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  border: '1px solid #03dac6',
                  padding: '5px 10px',
                  borderRadius: '4px'
                }}
              >
                👑 Admin Panel
              </Link>
            )}

            <button 
              onClick={handleLogout} 
              style={{ backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;