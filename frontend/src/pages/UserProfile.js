import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './UserProfile.css';
import EmployeeDashboard from './EmployeeDashboard';

const UserProfile = () => {
  const { email } = useParams();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'customer');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic
  };

  return (
    <>
      <Header />
      <main>
        <div className="profile-container">
          <h1>User Profile</h1>
          {user && <h2>Welcome, {user.first_name}!</h2>}
          {role === 'employee' ? (
            <>
              <h2>Employee Dashboard</h2>
              <EmployeeDashboard />
            </> 
          ) : (
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
      <Footer />
    </>
  );
};

export default UserProfile;
