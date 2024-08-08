import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleSameAddressChange = () => {
    setSameAddress(!sameAddress);
    if (!sameAddress) {
      setFormData({
        ...formData,
        billingAddress: formData.shippingAddress
      });
    }
  };

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>
      {user ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="dateOfBirth"
            placeholder="Date of Birth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="shippingAddress"
            placeholder="Shipping Address"
            value={formData.shippingAddress}
            onChange={handleChange}
            required
          />
          <input
            type="checkbox"
            checked={sameAddress}
            onChange={handleSameAddressChange}
          /> Billing address is the same as shipping address
          {!sameAddress && (
            <input
              type="text"
              name="billingAddress"
              placeholder="Billing Address"
              value={formData.billingAddress}
              onChange={handleChange}
              required
            />
          )}
          {message && <p className="message">{message}</p>}
          <button type="submit">Update Profile</button>
        </form>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default UserProfile;
