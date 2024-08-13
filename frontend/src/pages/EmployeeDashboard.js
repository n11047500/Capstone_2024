import React, { useState } from 'react';
import './UserProfile.css';
import AddProduct from './AddProduct';  // Adjust the import path based on your directory structure

const EmployeeDashboard = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeForm, setActiveForm] = useState(null);  // Manage which form is active

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

  const toggleForm = (formName) => {
    setActiveForm(activeForm === formName ? null : formName);
  };

  return (
    <div className="employee-dashboard">
      <div className="dashboard-buttons">
        <button onClick={() => toggleForm('addProduct')}>Add Product</button>
        <button onClick={() => toggleForm('editProduct')}>Edit Product</button>
        <button onClick={() => toggleForm('removeProduct')}>Remove Product</button>
        <button onClick={() => toggleForm('grantAccess')}>Grant Access to New User</button>
      </div>

      {activeForm === 'grantAccess' && (
        <form onSubmit={handleRoleUpdate} className="role-update-form">
          <label htmlFor="email">Enter user's email</label>
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
      )}

      {activeForm === 'addProduct' && <AddProduct />}

      {/* Add placeholders for Edit and Remove product forms if necessary */}
      {activeForm === 'editProduct' && (
        <div>
          {/* Edit Product Form Placeholder */}
          <p>Edit Product functionality will go here.</p>
        </div>
      )}

      {activeForm === 'removeProduct' && (
        <div>
          {/* Remove Product Form Placeholder */}
          <p>Remove Product functionality will go here.</p>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EmployeeDashboard;
