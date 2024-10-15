import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  // Check if CAPTCHA is enabled based on the environment variable
  const isCaptchaEnabled = process.env.REACT_APP_CAPTCHA_ENABLED === 'true';

  // State variables for managing email, password, error messages, and reCAPTCHA token
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null); // Store reCAPTCHA token
  const navigate = useNavigate();

  // Handle setting the reCAPTCHA token when the CAPTCHA is completed
  const handleCaptcha = (token) => {
    setCaptchaToken(token); // Set the reCAPTCHA token
    if (handleCaptcha) handleCaptcha(token);
  };


  // Handle form submission for login
  const handleLogin = async (e) => {
    e.preventDefault();

    // If CAPTCHA is enabled, check if it has been completed
    if (isCaptchaEnabled && !captchaToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    try {
      // Prepare the request payload
      const payload = {
        email,
        password
      };

      // If CAPTCHA is enabled, include the captchaToken in the request body
      if (isCaptchaEnabled) {
        payload.captchaToken = captchaToken;
      }

      // Send the login request to the backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
        navigate(`/user/${data.email}`);
      } else {
        const data = await response.json();
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      {/* Header component for consistent navigation */}
      <Header />
      <main>
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor='email'>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor='password'>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Link to the Forgot Password page */}
            <p className="forgot-link">
              Forgot your password? <a href="/forgot-password">Click Here</a>
            </p>
            {/* Google reCAPTCHA for user verification */}
            {isCaptchaEnabled && (          
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={handleCaptcha}
                className='captcha-login-container'
              />
            )}
            <button type="submit" className="login-button">Login</button>
          </form>
          {/* Display error message if any */}
          {error && <p className="error-message">{error}</p>}
          {/* Link to the signup page */}
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </main>
      {/* Footer component for consistent site information */}
      <Footer />
    </>
  );
};

export default LoginPage;