import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './UserProfile.css';

const UserProfile = () => {
  const { email } = useParams();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    dateOfBirth: '',
    shippingAddress: '',
    billingAddress: ''
  });
  const [sameAddress, setSameAddress] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/user/${email}`);
        const data = await response.json();
        setUser(data);
        setFormData({
          firstName: data.first_name,
          lastName: data.last_name,
          mobileNumber: data.mobile_number,
          dateOfBirth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          shippingAddress: data.shippingAddress || '',
          billingAddress: data.billingAddress || ''
        });
        setSameAddress(data.shippingAddress === data.billingAddress);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      ...(name === 'shippingAddress' && sameAddress ? { billingAddress: value } : {})
    }));
  };

  const handleCheckboxChange = (e) => {
    setSameAddress(e.target.checked);
    if (e.target.checked) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        billingAddress: prevFormData.shippingAddress
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user information.');
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error updating user information:', error);
      setMessage('Failed to update user information.');
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className="profile-container">
          <h1>User Profile</h1>
          {message && <p className="message">{message}</p>}
          {user ? (
            <form onSubmit={handleSubmit}>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />

              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />

              <label htmlFor="mobileNumber">Mobile Number:</label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
              />

              <label htmlFor="dateOfBirth">Date of Birth:</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              <label htmlFor="shippingAddress">Shipping Address:</label>
              <input
                type="text"
                id="shippingAddress"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
              />

              <label>
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={handleCheckboxChange}
                />
                Billing address is the same as shipping address
              </label>

              <label htmlFor="billingAddress">Billing Address:</label>
              <input
                type="text"
                id="billingAddress"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                disabled={sameAddress}
              />

              <button type="submit" className="update-button">Update Profile</button>
            </form>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UserProfile;
