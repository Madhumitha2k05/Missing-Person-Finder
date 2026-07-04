// File: client/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Inside client/src/pages/ForgotPassword.jsx

    const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
        // 🛑 CHANGE THE PORT FROM 5000 TO 5001 HERE:
        const res = await axios.post('http://localhost:5001/api/users/forgot-password-reset', {
        email,
        name,
        newPassword
        });
        
        setMessage(res.data.message);
        
        // Redirect to login screen after 2 seconds on success
        setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
    }
    };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '50px auto', backgroundColor: '#1f1f1f', borderRadius: '8px', color: '#fff', border: '1px solid #333' }}>
      <h2>Forgot Password</h2>
      <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}> Verify your identity details to recover your account.</p>
      
      {message && <p style={{ color: '#4caf50', fontWeight: 'bold' }}>{message}</p>}
      {error && <p style={{ color: '#f44336', fontWeight: 'bold' }}>{error}</p>}

      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Account Email Address:</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#121212', color: '#fff' }}
          />
        </div>
        <div>
          <label>Account Name (Case Sensitive):</label>
          <input 
            type="text" 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#121212', color: '#fff' }}
          />
        </div>
        <div>
          <label>Type New Password:</label>
          <input 
            type="password" 
            required 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#121212', color: '#fff' }}
          />
        </div>
        <button type="submit" style={{ padding: '12px', backgroundColor: '#bb86fc', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
          Reset Password
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#bb86fc', textDecoration: 'none' }}>Back to Login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;