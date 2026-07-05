import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          return;
        }

        const config = { 
          headers: { 'x-auth-token': token } 
        };

        // 1. Fetch real user account data from backend
        const userRes = await axios.get('http://localhost:5001/api/reports/account/me', config);
        setUser(userRes.data);

        // 2. Fetch logged-in user's submitted reports
        const reportsRes = await axios.get('http://localhost:5001/api/reports/myreports', config);
        setMyReports(reportsRes.data);
        
      } catch (err) {
        console.error("Error loading profile details:", err);
        setError("Failed to sync profile info from database.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="loading" style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;
  if (error) return <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '50px', fontWeight: 'bold' }}>⚠️ {error}</div>;

  return (
    <div className="profile-container">
      
      {/* USER PROFILE CARD */}
      <div className="user-profile-section">
        <div className="profile-header">
          <div className="profile-icon">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-meta">
            <h1>{user?.name || "No name found"}</h1>
            <p>{user?.email || "No email found"}</p>
          </div>
        </div>
      </div>

      {/* USER REPORTED CASES GRID */}
      <div className="user-reports-section">
        <h2>My Reported Cases</h2>
        {myReports.length === 0 ? (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>You haven't reported any cases yet.</p>
        ) : (
          <div className="reports-list-grid">
            {myReports.map(report => (
              <div key={report._id} className="mini-report-card">
                <img src={report.photoURL} alt={report.name} />
                <div className="mini-info">
                  <h3>{report.name}</h3>
                  <p style={{ margin: '2px 0' }}><strong>Age:</strong> {report.age}</p>
                  
                  <span className={`status-pill ${report.status?.toLowerCase() === 'found' ? 'found' : 'missing'}`}>
                    {report.status || 'Missing'}
                  </span>
                  
                  <Link to={`/reports/${report._id}`} className="view-link">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default ProfilePage;