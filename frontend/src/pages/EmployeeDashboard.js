import React from 'react';
import './UserProfile.css';

const EmployeeDashboard = () => {
  return (
    <div className="employee-dashboard">
      <h2>Employee Dashboard</h2>
      <div className="dashboard-buttons">
        <button>Add Product</button>
        <button>Edit Product</button>
        <button>Remove Product</button>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
