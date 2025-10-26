// File: client/src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import './AuthForm.css'; // <-- 1. IMPORT THE NEW CSS

function LoginPage() {
  const [formData, setFormData] = useState({
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
      const response = await axios.post('http://localhost:5001/api/users/login', formData);
      localStorage.setItem('token', response.data.token); // Save the token
      alert('Login successful!');
      navigate('/'); // Redirect to dashboard
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      setError(message);
    }
  };

  return (
    // 2. Use the container class
    <div className="auth-container">
      <h2>Login</h2>

      {error && <p className="error-message">{error}</p>}

      {/* 3. Use the form class and structure */}
      <form onSubmit={handleSubmit} className="auth-form">
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
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
      </form>

      {/* 4. Add link to Register page */}
      <Link to="/register" className="auth-link">
        Don't have an account? Register
      </Link>
    </div>
  );
}

export default LoginPage;