// File: client/src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReportCard from '../components/ReportCard';
import './DashboardPage.css'; // Make sure this is imported

// ✅ --- 1. DEFINE YOUR AGE CATEGORIES ---
// We define these outside the component
const ageRanges = {
  // We use 0-5 for Baby to include newborns
  'Baby': { min: 0, max: 5 }, 
  'Child': { min: 6, max: 12 },
  'Teenager': { min: 13, max: 19 },
  // We use 20-49 and 50+ to avoid overlap
  'Adult': { min: 20, max: 49 }, 
  'Old Person': { min: 50, max: 200 } // Use a large max number
};
// This array includes the "All" button
const filterCategories = ['All', 'Baby', 'Child', 'Teenager', 'Adult', 'Old Person'];


function DashboardPage() {
  // Your existing state (no changes)
  const [allReports, setAllReports] = useState([]); // Master list
  const [displayedReports, setDisplayedReports] = useState([]); // List to show
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  
  // ✅ --- 2. ADD NEW STATE FOR AGE FILTER ---
  const [activeAgeFilter, setActiveAgeFilter] = useState('All');

  // Your existing useEffect (no change)
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

  // ✅ --- 3. UPDATE YOUR EXISTING FUNCTIONS ---

  // Handle search bar (we just add one line to reset the age filter)
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setFilterActive(true); 
    setActiveAgeFilter('All'); // <-- ADDED: Reset age filter

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
  
  // ✅ --- 4. ADD NEW AGE FILTER FUNCTION ---
  const handleAgeFilter = (category) => {
    setActiveAgeFilter(category);
    setSearchTerm(''); // Clear search bar
    setFilterActive(true); // Show the "Clear" button

    if (category === 'All') {
      setDisplayedReports(allReports);
    } else {
      // Filter by the age range
      const { min, max } = ageRanges[category];
      const filtered = allReports.filter(report => 
        report.age >= min && report.age <= max
      );
      setDisplayedReports(filtered);
    }
  };

  // Handle "Find Near Me" (we add one line to reset age filter)
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsFinding(true);
    setFilterActive(true);
    setActiveAgeFilter('All'); // <-- ADDED: Reset age filter

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `http://localhost:5001/api/reports/nearme?lat=${latitude}&lng=${longitude}&distance=20`
          );
          setDisplayedReports(response.data);
          setSearchTerm(''); 
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

  // Handle "Clear Filter" (we add one line to reset age filter)
  const handleClear = () => {
    setDisplayedReports(allReports);
    setSearchTerm('');
    setFilterActive(false);
    setActiveAgeFilter('All'); // <-- ADDED: Reset age filter
  };

  return (
    <div>
      {/* Your existing header (no change) */}
      <div className="dashboard-header">
        <h1>Missing Person Reports Dashboard</h1>
        <p>Showing all active reports. Use the search box or find reports near you.</p>
      </div>
      
      {/* Your existing search container (no change) */}
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

      {/* ✅ --- 5. ADD THE NEW FILTER BUTTONS --- ✅ */}
      <div className="filter-container">
        {filterCategories.map((category) => (
          <button
            key={category}
            // Add 'active' class if this is the selected filter
            className={`filter-chip ${activeAgeFilter === category ? 'active' : ''}`}
            onClick={() => handleAgeFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Your existing reports list (no change, except one line) */}
      {loading ? (
        <p style={{textAlign: 'center'}}>Loading reports...</p>
      ) : (
        <div className="reports-container" style={{marginTop: '2rem'}}>
          
          {displayedReports.length > 0 ? (
            displayedReports.map((report) => (
              
              <Link 
                to={`/reports/${report._id}`} 
                key={report._id} 
                style={{ textDecoration: 'none' }}
              >
                <div className="report-card-wrapper">
                  <ReportCard report={report} />
                </div>
              </Link>
            ))
          ) : (
            // Updated text to make more sense with filters
            <p style={{textAlign: 'center'}}>No reports found for this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;