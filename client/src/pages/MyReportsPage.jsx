// File: client/src/pages/MyReportsPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReportCard from '../components/ReportCard';
import './MyReportsPage.css'; // <-- 1. IMPORT THE NEW CSS FILE

function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Your existing useEffect is perfect (no changes)
  useEffect(() => {
    const fetchMyReports = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/reports/myreports', {
          headers: { 'x-auth-token': token }
        });
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching my reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, []);

  // Your existing handleDelete function is perfect (no changes)
  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to permanently delete this report?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/reports/${reportId}`, {
          headers: { 'x-auth-token': token },
        });
        setReports(reports.filter(report => report._id !== reportId));
        alert('Report deleted successfully.');
      } catch (error) {
        console.error('Error deleting report', error);
        alert('Failed to delete the report.');
      }
    }
  };

  // ✅ --- 2. NEW FUNCTION ADDED --- ✅
  // This is the new logic for the status button
  const handleStatusChange = async (reportId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this report as "${newStatus}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5001/api/reports/${reportId}/status`,
        { status: newStatus }, // Send the new status
        { headers: { 'x-auth-token': token } }
      );

      // Update the report in our state to show the change immediately
      setReports(reports.map(report => 
        report._id === reportId ? response.data : report
      ));
      alert(`Report status updated to "${newStatus}"!`);

    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update status.');
    }
  };
  // ✅ --- END OF NEW FUNCTION --- ✅


  return (
    <div>
      <h1>My Reports</h1>
      <p>This page shows all the missing person reports you have submitted.</p>

      {loading ? (
        <p>Loading your reports...</p>
      ) : (
        <div className="reports-container" style={{marginTop: '2rem'}}>
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report._id} className="report-card-wrapper">
                <Link to={`/reports/${report._id}`} style={{ textDecoration: 'none' }}>
                  <ReportCard report={report} />
                </Link>

                <div className="card-actions">
                  {/* Your existing Edit button (no change) */}
                  <Link to={`/edit-report/${report._id}`} className="edit-button">Edit</Link>
                  
                  {/* Your existing Delete button (no change) */}
                  <button className="delete-button" onClick={() => handleDelete(report._id)}>
                    Delete
                  </button>

                  {/* ✅ --- 3. NEW BUTTONS ADDED --- ✅ */}
                  {/* This button shows if status is "Missing" */}
                  {report.status === 'Missing' && (
                    <button 
                      className="status-button-found"
                      onClick={() => handleStatusChange(report._id, 'Found')}
                    >
                      Mark as Found
                    </button>
                  )}
                  
                  {/* This button shows if status is "Found" */}
                  {report.status === 'Found' && (
                    <button 
                      className="status-button-missing"
                      onClick={() => handleStatusChange(report._id, 'Missing')}
                    >
                      Mark as Missing
                    </button>
                  )}
                  {/* ✅ --- END OF NEW BUTTONS --- ✅ */}

                </div>
              </div>
            ))
          ) : (
            <p>You have not submitted any reports yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MyReportsPage;