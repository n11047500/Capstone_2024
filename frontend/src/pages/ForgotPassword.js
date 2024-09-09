import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReCAPTCHA from 'react-google-recaptcha';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken }),
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Error sending reset link.');
    }
  };

  return (
    <>
    <Header />
    <main>
        <div className='forgot-container'>
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit}>
            <label>Enter your Email</label>
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            />
            <ReCAPTCHA
                sitekey={process.env.RECAPTCHA_SITE_KEY || '6LfpyS4qAAAAACV-9rKjHiyxg9LR0FOr6nVUUu2j'}
                onChange={handleCaptcha}
              />
            <button type="submit" className="send-link-button">Send Reset Link</button>
        </form>
        {message && <p>{message}</p>}
        </div>
    </main>
    <Footer />
    </>
  );
}


export default ForgotPassword;
