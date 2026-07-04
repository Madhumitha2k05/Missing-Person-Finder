import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProfilePage.css'; // This works here because it's in the same folder!

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Get User Details
        const userRes = await axios.get('http://localhost:5001/api/users/me', config);
        setUser(userRes.data);

        // 2. Get User's Reports
        const reportsRes = await axios.get('http://localhost:5001/api/reports/my-reports', config);
        setMyReports(reportsRes.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading Profile...</div>;

  return (
    <div className="profile-container">
      <div className="user-info-card">
        <div className="avatar-circle">{user?.name?.charAt(0).toUpperCase()}</div>
        <h1>{user?.name}</h1>
        <p>{user?.email}</p>
      </div>

      <div className="my-reports-section">
        <h2>My Reported Cases</h2>
        {myReports.length === 0 ? (
          <p>You haven't reported any cases yet.</p>
        ) : (
          <div className="reports-grid">
            {myReports.map(report => (
              <div key={report._id} className="small-report-card">
                <img src={report.photoURL} alt={report.name} />
                <div className="card-body">
                  <h3>{report.name}</h3>
                  <span className={`status ${report.status.toLowerCase()}`}>{report.status}</span>
                  <Link to={`/reports/${report._id}`}>View Details</Link>
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