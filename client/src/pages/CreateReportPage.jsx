// File: client/src/pages/CreateReportPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Form.css'; // We will style this in the next step

function CreateReportPage() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male', // Default value
    lastSeenLocation: '',
    description: '',
    contactPhone: '' // New field
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(''); // State for showing errors
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Fix for age being sent as string
    const updatedValue = name === 'age' ? (value ? Number(value) : '') : value;
    setFormData({ ...formData, [name]: updatedValue });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!photo) {
      setError('Photo is required.');
      return;
    }

    const reportData = new FormData();
    reportData.append('name', formData.name);
    reportData.append('age', formData.age);
    reportData.append('gender', formData.gender);
    reportData.append('lastSeenLocation', formData.lastSeenLocation);
    reportData.append('description', formData.description);
    reportData.append('contactPhone', formData.contactPhone); // Add phone
    reportData.append('photo', photo);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/reports', reportData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Report submitted successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error submitting report', err);
      // Show specific error from backend if available
      const message = err.response?.data?.msg || 'Failed to submit report. Please check the details and try again.';
      setError(message);
      alert(`Error: ${message}`); // Also show in alert
    }
  };

  return (
    <div className="form-container professional-form"> {/* Added class */}
      <h2>Report a Missing Person</h2>
      <p>Please provide as much detail as possible.</p>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        {/* Age & Gender side-by-side */}
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

        {/* Last Seen Location */}
        <div className="form-group">
          <label htmlFor="lastSeenLocation">Last Seen Location *</label>
          <input type="text" id="lastSeenLocation" name="lastSeenLocation" value={formData.lastSeenLocation} onChange={handleChange} required placeholder="e.g., New Bus Stand, Salem, Tamil Nadu"/>
          <small>Be specific for accurate mapping.</small>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description (Clothing, details) *</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="4" />
        </div>

        {/* Contact Phone (Optional) */}
        <div className="form-group">
          <label htmlFor="contactPhone">Your Contact Phone (Optional)</label>
          <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="e.g., 9876543210"/>
           <small>Used only if someone finds the person.</small>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label htmlFor="photo">Upload Recent Photo *</label>
          <input type="file" id="photo" name="photo" onChange={handlePhotoChange} required accept="image/*" />
          {photo && <p className="file-name">Selected: {photo.name}</p>}
        </div>

        <button type="submit" className="submit-button">Submit Report</button>
      </form>
    </div>
  );
}

export default CreateReportPage;