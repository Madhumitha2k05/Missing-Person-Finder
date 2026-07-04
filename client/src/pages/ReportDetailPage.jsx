// client/src/pages/ReportDetailPage.jsx

import { useState, useEffect, useRef } from 'react'; // Added useRef here
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// Import map components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import html2canvas from 'html2canvas'; // New tool for poster
import jsPDF from 'jspdf'; // New tool for PDF
import './ReportDetailPage.css'; // CSS for layout

function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Create a "ref" to find our hidden poster template in the HTML
  const posterRef = useRef();

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

  // ✅ --- POSTER GENERATOR LOGIC --- ✅
  const downloadPoster = async () => {
    const element = posterRef.current;
    
    // We briefly show the template so the tool can "see" it to take a photo
    element.style.display = 'block'; 
    
    try {
      const canvas = await html2canvas(element, {
        useCORS: true, // This allows us to use your Cloudinary photos
        scale: 2, // High quality
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MISSING_POSTER_${report.name}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Could not generate PDF. Please try again.");
    }
    
    // Hide it again after the PDF is made
    element.style.display = 'none'; 
  };

  if (loading) return <p>Loading details...</p>;
  if (!report) return <p>Report not found.</p>;

  // --- Map Logic ---
  const position =
    report.location?.coordinates &&
    report.location.coordinates.length === 2 &&
    (report.location.coordinates[0] !== 0 || report.location.coordinates[1] !== 0)
    ? [report.location.coordinates[1], report.location.coordinates[0]] 
    : null;

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

          {/* ✅ --- NEW POSTER BUTTON --- ✅ */}
          <div className="action-buttons">
            <button onClick={downloadPoster} className="poster-button">
              📥 Download Print Poster (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* --- Map Rendering --- */}
      <div className="map-section">
         <h2>Last Known Location on Map</h2>
         {position ? ( 
           <div className="map-wrapper">
             <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
               <TileLayer
                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
               />
               <Marker position={position}>
                 <Popup>{report.lastSeenLocation}</Popup>
               </Marker>
             </MapContainer>
           </div>
         ) : ( 
           <p>Map location could not be determined for this report.</p>
         )}
      </div>

      {/* --- ✅ HIDDEN POSTER TEMPLATE (ONLY USED FOR PDF) ✅ --- */}
      <div id="poster-template" ref={posterRef} style={{ display: 'none' }}>
        <div className="poster-content">
          <h1 className="poster-title">MISSING</h1>
          <img src={report.photoURL} alt="Missing" className="poster-img" />
          <h2 className="poster-name">{report.name}</h2>
          <div className="poster-details-grid">
            <p><strong>AGE:</strong> {report.age}</p>
            <p><strong>GENDER:</strong> {report.gender}</p>
            <p><strong>LAST SEEN:</strong> {report.lastSeenLocation}</p>
            <p><strong>DETAILS:</strong> {report.description}</p>
          </div>
          <div className="poster-footer">
            <h3>PLEASE CONTACT IMMEDIATELY:</h3>
            <p className="poster-phone">{report.contactPhone || "LOCAL POLICE STATION"}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ReportDetailPage;