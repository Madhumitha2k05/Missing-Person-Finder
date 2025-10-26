// File: client/src/pages/FoundPersonsPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReportCard from '../components/ReportCard';

function FoundPersonsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This hook fetches ONLY the "Found" reports
    const fetchFoundReports = async () => {
      try {
        setLoading(true);
        // We call our new backend route
        const response = await axios.get('http://localhost:5001/api/reports/found');
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching found reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoundReports();
  }, []);

  return (
    <div>
      <div className="dashboard-header"> {/* Use the same header style */}
        <h1>Found Persons</h1>
        <p>This page shows all reports that have been marked as "Found".</p>
      </div>
      
      {loading ? (
        <p style={{textAlign: 'center'}}>Loading reports...</p>
      ) : (
        <div className="reports-container" style={{marginTop: '2rem'}}>
          {reports.length > 0 ? (
            reports.map((report) => (
              // Each card is a link to the details page
              <Link to={`/reports/${report._id}`} key={report._id} style={{ textDecoration: 'none' }}>
                <div className="report-card-wrapper">
                  <ReportCard report={report} />
                  {/* This page has no Edit/Delete buttons */}
                </div>
              </Link>
            ))
          ) : (
            <p style={{textAlign: 'center'}}>No "Found" reports yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default FoundPersonsPage;