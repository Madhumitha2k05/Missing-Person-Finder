// File: client/src/pages/RegisterPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import './AuthForm.css'; // <-- 1. IMPORT THE NEW CSS

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      await axios.post('http://localhost:5001/api/users/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.response?.data?.msg || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  return (
    // 2. Use the container class
    <div className="auth-container">
      <h2>Register</h2>

      {error && <p className="error-message">{error}</p>}

      {/* 3. Use the form class and structure */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6" // Add password length requirement
          />
        </div>
        <button type="submit" className="auth-button">Register</button>
      </form>

      {/* 4. Add link to Login page */}
      <Link to="/login" className="auth-link">
        Already have an account? Login
      </Link>
    </div>
  );
}

export default RegisterPage;