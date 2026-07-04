// File: client/src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios'; // ✅ FIXED: Clean and correct import for axios
import './AuthForm.css'; 

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
    setError(''); 

    // 🔥 ✅ Master Admin Direct Override Check
    if (formData.email.toLowerCase() === 'admin@gmail.com' && formData.password === 'admin@2311') {
      localStorage.setItem('token', 'fake-admin-token-override'); 
      alert('Welcome Master Administrator!');
      navigate('/admin'); 
      return; 
    }

    // --- Process Normal Regular User Accounts ---
    try {
      const response = await axios.post('http://localhost:5001/api/users/login', formData);
      localStorage.setItem('token', response.data.token); 
      alert('Login successful!');
      navigate('/'); 
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      setError(message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {error && <p className="error-message">{error}</p>}

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

      <Link to="/register" className="auth-link">
        Don't have an account? Register
      </Link>

      <div style={{ marginTop: '12px' }}>
        <Link to="/forgot-password" className="auth-link" style={{ color: '#bb86fc' }}>
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;