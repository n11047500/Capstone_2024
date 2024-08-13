import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './UserProfile.css';
import EmployeeDashboard from './EmployeeDashboard';  // Assuming you have created this component

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
    // Add your form submission logic here
  };

  return (
    <>
      <Header />
      <main>
        <div className="profile-container">
          <h1>User Profile</h1>
          {role === 'employee' ? (
            <EmployeeDashboard />  // Show employee-specific interface
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Existing form fields go here */}
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              {/* Add other form fields here */}
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
