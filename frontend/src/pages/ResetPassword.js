import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReCAPTCHA from 'react-google-recaptcha';
import './ResetPassword.css';

function ResetPassword() {
  // Extract the token from the URL parameters
  const { token } = useParams();
  // State variables for new password input, messages, and reCAPTCHA token
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  // Handle reCAPTCHA token when user completes the CAPTCHA
  const handleCaptcha = (token) => {
    setCaptchaToken(token);
  };

  // Handle form submission for resetting the password
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if reCAPTCHA is completed
    if (!captchaToken) {
      setMessage('Please complete the CAPTCHA.');
      return;
    }

    try {
      // Send the new password and token to the backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, captchaToken }),
      });

      // Update the message based on the response
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Error resetting password.');
    }
  };

  return (
    <>
      {/* Header component for consistent navigation */}
      <Header />
      <main>
        <div className='reset-container'>
          <h1>Reset User Password</h1>
          <form onSubmit={handleSubmit}>
            <label>Enter your New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password"
            />
            {/* Google reCAPTCHA for verification */}
            <ReCAPTCHA
              sitekey={process.env.RECAPTCHA_SITE_KEY || '6LfpyS4qAAAAACV-9rKjHiyxg9LR0FOr6nVUUu2j'}
              onChange={handleCaptcha}
              className='captcha-reset-container'
            />
            <button type="submit" className='reset-button'>Reset Password</button>
          </form>
          {/* Display the response message after submission */}
          {message && <p>{message}</p>}
        </div>
      </main>
      {/* Footer component for consistent site information */}
      <Footer />
    </>
  );
}

export default ResetPassword;
