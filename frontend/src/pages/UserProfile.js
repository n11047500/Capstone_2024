import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './UserProfile.css';

const UserProfile = () => {
  const { email } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    date_of_birth: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3001/user/${email}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setFormData({
            first_name: data.first_name,
            last_name: data.last_name,
            mobile_number: data.mobile_number,
            date_of_birth: data.date_of_birth
          });
        } else {
          setError('User not found');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      }
    };

    fetchUser();
  }, [email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/user/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setUser({ ...user, ...formData });
        setIsEditing(false);
      } else {
        setError('Failed to update user information');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  if (!user) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="profile-container">
          <h1>User Profile</h1>
          {error && <p className="error-message">{error}</p>}
          {!isEditing ? (
            <div>
              <p><strong>First Name:</strong> {user.first_name}</p>
              <p><strong>Last Name:</strong> {user.last_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Mobile Number:</strong> {user.mobile_number}</p>
              <p><strong>Date of Birth:</strong> {user.date_of_birth}</p>
              <button onClick={() => setIsEditing(true)} className="edit-button">Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              <label>First Name:</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
              <label>Last Name:</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
              <label>Mobile Number:</label>
              <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} />
              <label>Date of Birth:</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
              <button type="submit" className="save-button">Save</button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UserProfile;
