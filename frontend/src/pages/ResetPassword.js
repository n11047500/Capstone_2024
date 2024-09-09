import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ResetPassword.css'

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Error resetting password.');
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className='reset-container'>
          <h1>Reset Password</h1>
          <form onSubmit={handleSubmit}>
            <label>Enter your New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password"
            />
            <button type="submit" className='reset-button'>Reset Password</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ResetPassword;