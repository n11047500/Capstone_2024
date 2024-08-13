import React, { useState } from 'react';
import './UserProfile.css';

const EmployeeDashboard = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleRoleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/update-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'employee' })
      });

      if (response.ok) {
        setMessage(`Successfully updated ${email} to employee role.`);
      } else {
        setMessage('Failed to update role. Please check the email and try again.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="dashboard-buttons">
        <button>Add Product</button>
        <button>Edit Product</button>
        <button>Remove Product</button>
      </div>
      <form onSubmit={handleRoleUpdate} className="role-update-form">
        <label htmlFor="email">Grant Employee Access</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter user's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="update-button">Grant Access</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EmployeeDashboard;
