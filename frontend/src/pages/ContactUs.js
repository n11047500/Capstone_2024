import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReCAPTCHA from 'react-google-recaptcha';
import './ContactUs.css';

import clock from "../assets/clock_img.png";
import phone from "../assets/phone_img.png";
import email from "../assets/email_img.png";

function ContactUs() {
  // Check if CAPTCHA is enabled from environment variable
  const isCaptchaEnabled = process.env.REACT_APP_CAPTCHA_ENABLED === 'true';

  // State for storing form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    inquiry: '',
  });
  // State for storing reCAPTCHA token
  const [captchaToken, setCaptchaToken] = useState(null);
  // State for displaying feedback message
  const [message, setMessage] = useState('');

  // Handler for reCAPTCHA, sets the token when completed
  const handleCaptcha = (token) => {
    setCaptchaToken(token); // Set the reCAPTCHA token
    if (handleCaptcha) handleCaptcha(token);
  };

  // Handle form input changes and update state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare the request payload, including captchaToken only if CAPTCHA is enabled
      const totalForm = isCaptchaEnabled
        ? { ...formData, captchaToken }
        : formData;

      // Send form data to the backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(totalForm),
      });

      // Display appropriate message based on the response
      if (response.ok) {
        setMessage('Your inquiry has been sent successfully!');
        // Reset form fields after successful submission
        setFormData({ first_name: '', last_name: '', email: '', mobile: '', inquiry: '' });
      } else {
        setMessage('Failed to send your inquiry. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="ContactUs">
      <Header />
      <div className='contact_section'>
        <h1>Contact Us</h1>
        <h2>We'd love to hear all general enquiries you may have about Ezee Planter Boxes. Contact us via the form below, call our office on 07 3284 8180, or drop in for a chat in our office at: 21 Huntington Street, Clontarf QLD 4019</h2>
        
        <div className='contact-flexbox'>
          {/* Left Box containing contact details */}
          <div className="contact-flexbox left-box">
            {/* Email information */}
            <div className="contact-container">
              <div className="img-container">
                <img src={email} alt="email" className="Img" />
              </div>
              <p className="contact-text">
                <b>Email</b> <br /> sales@ezeeind.com.au
              </p>
            </div>

            {/* Phone information */}
            <div className="contact-container">
              <div className="img-container">
                <img src={phone} alt="phone" className="Img" />
              </div>
              <p className="contact-text">
                <b>Phone</b> <br /> 07 3284 8180
              </p>
            </div>

            {/* Opening hours information */}
            <div className="contact-container">
              <div className="img-container">
                <img src={clock} alt="clock" className="Img" />
              </div>
              <p className="contact-text">
                <b>Opening Hours</b><br />
                Mon-Thurs 7:30am – 4pm <br />
                Friday 7:30am – 2pm
              </p>
            </div>
          </div>

          {/* Right Box containing the contact form */}
          <div className="contact-flexbox right-box">
            <form onSubmit={handleSubmit} className="contact-form">
              <table className="form-table">
                <tbody>
                  <tr>
                    <td>
                      <label htmlFor="first_name">First Name:</label><br />
                      <input type="text" id="first_name" name="first_name" placeholder="Your First Name..." value={formData.first_name} onChange={handleChange} required /><br />
                    </td>
                    <td>
                      <label htmlFor="last_name">Last Name:</label><br />
                      <input type="text" id="last_name" name="last_name" placeholder="Your Last Name..." value={formData.last_name} onChange={handleChange} required /><br />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="email">Email:</label><br />
                      <input type="email" id="email" name="email" placeholder="Your Email..." value={formData.email} onChange={handleChange} required /><br />
                    </td>
                    <td>
                      <label htmlFor="mobile">Mobile Number:</label><br />
                      <input type="text" id="mobile" name="mobile" placeholder="(optional)" value={formData.mobile} onChange={handleChange} /><br />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <label htmlFor="inquiry">Enquiry:</label><br />
                      <textarea id="inquiry" name="inquiry" placeholder="Write your inquiry here..." value={formData.inquiry} onChange={handleChange} required></textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className='captcha-submit-container'>
                {/* Google reCAPTCHA for validation */}
                {isCaptchaEnabled && (
                  <ReCAPTCHA
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                    onChange={handleCaptcha}
                  />
                )}
                <button type="submit" className="submit-button">Submit Form</button>
              </div>
            </form>

            {/* Display response message after form submission */}
            {message && <p className="response-message" role='alert'>{message}</p>}
          </div>
        </div>
      </div>

      {/* Map section displaying office location */}
      <div className='map_section'>
        <iframe
          loading="lazy"
          src="https://maps.google.com/maps?q=21%20Huntington%20Street%2C%20Clontarf%20QLD%204019&amp;t=m&amp;z=16&amp;output=embed&amp;iwloc=near"
          title="21 Huntington Street, Clontarf QLD 4019"
          aria-label="21 Huntington Street, Clontarf QLD 4019"
          width='100%'
          height='85%'
          frameBorder="0">
        </iframe>
      </div>

      <Footer />
    </div>
  );
}

export default ContactUs;