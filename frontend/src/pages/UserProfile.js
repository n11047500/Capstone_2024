import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './UserProfile.css';
import EmployeeDashboard from './EmployeeDashboard';

const UserProfile = () => {
  // Extract the email parameter from the URL
  const { email } = useParams();
  // State for storing user information
  const [user, setUser] = useState(null);
  // State for storing the role (customer or employee)
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'customer');
  // State for storing form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    dateOfBirth: '',
    shippingAddress: '',
    billingAddress: ''
  });
  // State for checking if the billing address is the same as the shipping address
  const [sameAddress, setSameAddress] = useState(false);
  // State for storing feedback messages
  const [message, setMessage] = useState('');

  // Fetch user data when the component mounts or email changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/user/${email}`);
        const data = await response.json();
        setUser(data);
        // Populate form data with fetched user details
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

  // Handle form submission
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
      {/* Header component for consistent navigation */}
      <Header />
      <main>
        <div className="profile-container">
          <h1>{role === 'employee' ? 'Employee Dashboard' : 'User Profile'}</h1>
          {user && <h2>Welcome, {user.first_name}!</h2>}
          {message && <p className="message">{message}</p>}
          {role === 'employee' ? (
            <>
              {/* Display the employee dashboard if the user is an employee */}
              <EmployeeDashboard />
            </>
          ) : (
            // Display the user profile form for customers
            <form onSubmit={handleSubmit}>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />

              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />

              <label htmlFor="mobileNumber">Mobile Number:</label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />

              <label htmlFor="dateOfBirth">Date of Birth:</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />

              <label htmlFor="shippingAddress">Shipping Address:</label>
              <input
                type="text"
                id="shippingAddress"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              />

              <label>
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={(e) => {
                    setSameAddress(e.target.checked);
                    if (e.target.checked) {
                      setFormData({ ...formData, billingAddress: formData.shippingAddress });
                    }
                  }}
                />
                Billing address is the same as shipping address
              </label>

              <label htmlFor="billingAddress">Billing Address:</label>
              <input
                type="text"
                id="billingAddress"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                disabled={sameAddress}
              />

              <button type="submit" className="update-button">Update Profile</button>
            </form>
          )}
        </div>
      </main>
      {/* Footer component for consistent site information */}
      <Footer />
    </>
  );
};

export default UserProfile;