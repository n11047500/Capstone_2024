import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReCAPTCHA from 'react-google-recaptcha';
import './ForgotPassword.css';

function ForgotPassword() {
  // State variables for email input, message display, and reCAPTCHA token
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  // Handle reCAPTCHA token setting
  const handleCaptcha = (token) => {
    setCaptchaToken(token);
  };

  // Handle form submission for sending a reset password link
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if reCAPTCHA has been completed
    if (!captchaToken) {
      setMessage('Please complete the CAPTCHA.');
      return;
    }

    try {
      // Send request to the backend API for password reset
      const response = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken }),
      });
      const result = await response.json();
      setMessage(result.message); // Display response message
    } catch (error) {
      setMessage('Error sending reset link.');
    }
  };

  return (
    <>
      {/* Header component for consistent navigation */}
      <Header />
      <main>
        <div className='forgot-container'>
          <h1>Forgot Password</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Enter your Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            {/* Google reCAPTCHA for verification */}
            <ReCAPTCHA
              sitekey={process.env.RECAPTCHA_SITE_KEY}
              onChange={handleCaptcha}
              className='captcha-forgot-container'
            />
            <button type="submit" className="send-link-button">Send Reset Link</button>
          </form>
          {/* Display message after submission */}
          {message && <p>{message}</p>}
        </div>
      </main>
      {/* Footer component for consistent site information */}
      <Footer />
    </>
  );
}

export default ForgotPassword;