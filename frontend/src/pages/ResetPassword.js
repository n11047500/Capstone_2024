import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReCAPTCHA from 'react-google-recaptcha';
import './ResetPassword.css'

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null); // Store reCAPTCHA token

  const handleCaptcha = (token) => {
    setCaptchaToken(token); // Set the reCAPTCHA token
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setMessage('Please complete the CAPTCHA.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, captchaToken }),
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
            <ReCAPTCHA
              sitekey={process.env.RECAPTCHA_SITE_KEY || '6LfpyS4qAAAAACV-9rKjHiyxg9LR0FOr6nVUUu2j'}
              onChange={handleCaptcha}
              className='captcha-reset-container'
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