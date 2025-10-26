// File: client/src/pages/EditReportPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Form.css'; // Use the same CSS

function EditReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', lastSeenLocation: '', description: '', contactPhone: '' // Added phone
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/reports/${id}`);
        // Ensure all fields exist, provide defaults if not
        setFormData({
          name: response.data.name || '',
          age: response.data.age || '',
          gender: response.data.gender || 'Male',
          lastSeenLocation: response.data.lastSeenLocation || '',
          description: response.data.description || '',
          contactPhone: response.data.contactPhone || '' // Fetch phone
        });
      } catch (err) {
        console.error('Could not fetch report data', err);
        setError('Report not found or error loading data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === 'age' ? (value ? Number(value) : '') : value;
    setFormData({ ...formData, [name]: updatedValue });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const reportData = new FormData();
    // Use Object.entries for cleaner looping
    Object.entries(formData).forEach(([key, value]) => {
      reportData.append(key, value);
    });
    if (photo) {
      reportData.append('photo', photo);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/reports/${id}`, reportData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        },
      });
      alert('Report updated successfully!');
      navigate('/my-reports'); // Go back to My Reports page
    } catch (err) {
      console.error('Error updating report', err);
      const message = err.response?.data?.msg || 'Failed to update report.';
      setError(message);
      alert(`Error: ${message}`);
    }
  };

  if (loading) return <p>Loading report details...</p>;

  return (
    <div className="form-container professional-form">
      <h2>Edit Missing Person Report</h2>
      {error && <p className="error-message">{error}</p>}

       <form onSubmit={handleSubmit}>
        {/* Re-using the same structure as CreateReportPage */}
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} required min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lastSeenLocation">Last Seen Location *</label>
          <input type="text" id="lastSeenLocation" name="lastSeenLocation" value={formData.lastSeenLocation} onChange={handleChange} required placeholder="e.g., New Bus Stand, Salem, Tamil Nadu"/>
          <small>Be specific for accurate mapping.</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Clothing, details) *</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="4" />
        </div>

        <div className="form-group">
          <label htmlFor="contactPhone">Your Contact Phone (Optional)</label>
          <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="e.g., 9876543210"/>
           <small>Used only if someone finds the person.</small>
        </div>

        <div className="form-group">
          {/* Show current photo maybe? For now, just upload new */}
          <label htmlFor="photo">Upload New Photo (Optional)</label>
          <input type="file" id="photo" name="photo" onChange={handlePhotoChange} accept="image/*" />
           {photo && <p className="file-name">Selected: {photo.name}</p>}
        </div>

        <button type="submit" className="submit-button">Update Report</button>
      </form>
    </div>
  );
}

export default EditReportPage;