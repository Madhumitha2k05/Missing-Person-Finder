// File: client/src/pages/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuthForm.css'; 

function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all listings inside database registry using admin privileges
  const fetchAllReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/reports/admin/all', {
        headers: { 'x-auth-token': token }
      });
      setReports(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load system administration files.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  // Action: Master Admin status override to Found
  const handleMarkAsFound = async (id) => {
    if (!window.confirm("Are you sure you want to change this person's status to Found?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/reports/admin/status/${id}`, 
        { status: 'Found' },
        { headers: { 'x-auth-token': token } }
      );
      alert("Status updated to Found successfully!");
      fetchAllReports(); 
    } catch (err) {
      alert("Failed to alter status code framework: Check configuration.");
    }
  };

  // Action: Master Admin permanent index wipe
  const handleDeleteReport = async (id) => {
    if (!window.confirm("🚨 CRITICAL: Are you sure you want to permanently delete this report from the platform registry?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/reports/admin/delete/${id}`, {
        headers: { 'x-auth-token': token }
      });
      alert("Report permanently removed from system index.");
      fetchAllReports(); 
    } catch (err) {
      alert("Delete transaction failed.");
    }
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading Administration Controls...</div>;

  return (
    <div style={{ padding: '2rem', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid #bb86fc', paddingBottom: '10px', marginBottom: '20px' }}>👑 Master Administration Panel</h2>
      
      {error && <p style={{ color: '#f44336', fontWeight: 'bold' }}>{error}</p>}
      
      {reports.length === 0 ? (
        <p>No reports found in system registry.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {reports.map((report) => (
            <div key={report._id} style={{ backgroundColor: '#1f1f1f', borderRadius: '8px', padding: '15px', border: '1px solid #333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <img src={report.photoURL} alt={report.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
                <h3>{report.name} ({report.age})</h3>
                <p><strong>Gender:</strong> {report.gender}</p>
                <p><strong>Location:</strong> {report.lastSeenLocation}</p>
                <p>
                  <strong>Status: </strong> 
                  <span style={{ color: report.status === 'Found' ? '#4caf50' : '#ff9800', fontWeight: 'bold' }}>
                    {report.status || 'Missing'}
                  </span>
                </p>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {report.status !== 'Found' && (
                  <button 
                    onClick={() => handleMarkAsFound(report._id)}
                    style={{ padding: '10px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Mark as Found ✓
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteReport(report._id)}
                  style={{ padding: '10px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Delete Report 🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;