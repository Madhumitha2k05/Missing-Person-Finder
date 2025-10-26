// File: client/src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReportCard from '../components/ReportCard';
import './DashboardPage.css'; // Make sure this is imported

function DashboardPage() {
  const [allReports, setAllReports] = useState([]); // Master list
  const [displayedReports, setDisplayedReports] = useState([]); // List to show
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  // 1. Fetch ALL reports once on page load
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/reports');
        setAllReports(response.data);
        setDisplayedReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // 2. Handle search bar typing
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setFilterActive(true); 

    if (term === '') {
      setDisplayedReports(allReports);
    } else {
      const filtered = allReports.filter((report) => {
        const nameMatch = report.name.toLowerCase().includes(term.toLowerCase());
        const locationMatch = report.lastSeenLocation.toLowerCase().includes(term.toLowerCase());
        return nameMatch || locationMatch;
      });
      setDisplayedReports(filtered);
    }
  };

  // 3. Handle "Find Near Me" button click
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsFinding(true);
    setFilterActive(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `http://localhost:5001/api/reports/nearme?lat=${latitude}&lng=${longitude}&distance=20`
          );
          setDisplayedReports(response.data);
          setSearchTerm(''); // Clear the search bar
        } catch (error) {
          console.error("Error fetching nearby reports:", error);
          alert("Could not find nearby reports.");
        } finally {
          setIsFinding(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Could not get your location. Please allow location access.");
        setIsFinding(false);
      }
    );
  };

  // 4. Handle "Clear Filter" button click
  const handleClear = () => {
    setDisplayedReports(allReports);
    setSearchTerm('');
    setFilterActive(false);
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Missing Person Reports Dashboard</h1>
        <p>Showing all active reports. Use the search box or find reports near you.</p>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name or last seen location..."
          className="search-bar"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="find-near-me-btn" onClick={handleFindNearMe} disabled={isFinding}>
          {isFinding ? 'Finding...' : 'Find Near Me'}
        </button>
        {filterActive && (
          <button className="clear-filter-btn" onClick={handleClear}>
            Clear Filter
          </button>
        )}
      </div>

      {loading ? (
        <p style={{textAlign: 'center'}}>Loading reports...</p>
      ) : (
        <div className="reports-container" style={{marginTop: '2rem'}}>
          
          {displayedReports.length > 0 ? (
            displayedReports.map((report) => (
              
              // --- ✅ THIS IS THE CORRECTED CODE ---
              // 'key' and 'style' are now outside the 'to' prop
              <Link 
                to={`/reports/${report._id}`} 
                key={report._id} 
                style={{ textDecoration: 'none' }}
              >
                <div className="report-card-wrapper">
                  <ReportCard report={report} />
                </div>
              </Link>
              // --- ✅ END OF CORRECTION ---

            ))
          ) : (
            <p style={{textAlign: 'center'}}>No reports found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;