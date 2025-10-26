// client/src/pages/ReportDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// Import map components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './ReportDetailPage.css'; // CSS for layout

function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/reports/${id}`);
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching report details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return <p>Loading details...</p>;
  if (!report) return <p>Report not found.</p>;

  // --- Map Logic ---
  // 1. Check if coordinates are valid (exist, have 2 numbers, not [0,0])
  const position =
    report.location?.coordinates &&
    report.location.coordinates.length === 2 &&
    (report.location.coordinates[0] !== 0 || report.location.coordinates[1] !== 0)
    ? [report.location.coordinates[1], report.location.coordinates[0]] // Leaflet needs [LAT, LNG]
    : null; // Set to null if invalid

  const statusClass = `status-tag status-${report.status?.toLowerCase() || 'missing'}`;

  return (
    <div className="detail-page-container">
      <Link to="/" className="back-link">← Back to Dashboard</Link>

      <div className="detail-card">
        <img src={report.photoURL} alt={report.name} className="detail-photo" />
        <div className="detail-info">
          <div className="detail-header">
             <h1>{report.name}</h1>
             <span className={statusClass}>{report.status || 'Missing'}</span>
          </div>
          <p><strong>Age:</strong> {report.age}</p>
          <p><strong>Gender:</strong> {report.gender}</p>
          <p><strong>Last Seen Location:</strong> {report.lastSeenLocation}</p>
          <p><strong>Description:</strong> {report.description}</p>
          {report.contactPhone && (
            <p><strong>Contact Phone:</strong> {report.contactPhone}</p>
          )}
        </div>
      </div>

      {/* --- Map Rendering --- */}
      {/* 2. Conditionally render map section */}
      <div className="map-section">
         <h2>Last Known Location on Map</h2>
         {position ? ( // 3. Only render MapContainer if position is valid
           <div className="map-wrapper"> {/* Needs height from CSS */}
             <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
               <TileLayer
                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               />
               <Marker position={position}>
                 <Popup>{report.lastSeenLocation}</Popup>
               </Marker>
             </MapContainer>
           </div>
         ) : ( // 4. Show message if position is invalid
           <p>Map location could not be determined for this report.</p>
         )}
      </div>
      {/* --- End Map Rendering --- */}

    </div>
  );
}

export default ReportDetailPage;