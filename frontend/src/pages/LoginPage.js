import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null); // Store reCAPTCHA token
  const navigate = useNavigate();

  const handleCaptcha = (token) => {
    setCaptchaToken(token); // Set the reCAPTCHA token
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken })
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
      <Header />
      <main>
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="forgot-link">
            Forgot your password? <a href="/forgot-password">Click Here</a>
            </p>
            <ReCAPTCHA
              sitekey={process.env.RECAPTCHA_SITE_KEY || '6LfpyS4qAAAAACV-9rKjHiyxg9LR0FOr6nVUUu2j'}
              onChange={handleCaptcha}
            />
            <button type="submit" className="login-button">Login</button>
          </form>
          {error && <p className="error-message">{error}</p>}
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LoginPage;
