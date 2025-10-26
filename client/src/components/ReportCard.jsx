// File: client/src/components/ReportCard.jsx

import './ReportCard.css'; // Your existing CSS file

function ReportCard({ report }) {
  // Your existing safety check
  if (!report) {
    return null;
  }

  // --- NEW CODE ---
  // This creates a CSS class based on the report's status
  // It will be 'status-tag status-missing' or 'status-tag status-found'
  const statusClass = `status-tag status-${report.status.toLowerCase()}`;
  // --- END OF NEW CODE ---

  return (
    <div className="report-card">
      {/* Your existing photo code */}
      {report.photoURL && (
        <img src={report.photoURL} alt={`Photo of ${report.name}`} className="report-photo" />
      )}

      <div className="card-content">
        
        {/* --- UPDATED SECTION --- */}
        {/* We wrap the name and the new tag in a header for good alignment */}
        <div className="card-header">
          <h2>{report.name}</h2>
          {/* This is your new "Missing" tag! */}
          {report.status && (
            <span className={statusClass}>
              {report.status}
            </span>
          )}
        </div>
        {/* --- END OF UPDATED SECTION --- */}

        {/* Your existing <p> tags for details */}
        <p><strong>Age:</strong> {report.age}</p>
        <p><strong>Gender:</strong> {report.gender}</p>
        <p><strong>Last Seen:</strong> {report.lastSeenLocation}</p>
        
        {/* We give the description a new class so we can style it */}
        <p className="card-description">{report.description}</p>
      </div>
    </div>
  );
}

export default ReportCard;