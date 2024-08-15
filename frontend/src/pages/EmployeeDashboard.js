import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';

const EmployeeDashboard = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeForm, setActiveForm] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

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

  const handleProductSelect = (e) => {
    setSelectedProductId(e.target.value);
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

      {activeForm === 'editProduct' && (
        <>
          <label htmlFor="productSelect">Select a Product to Edit:</label>
          <select
            id="productSelect"
            value={selectedProductId}
            onChange={handleProductSelect}
            className="product-select-dropdown"
          >
            <option value="">--Select a Product--</option>
            {products.map(product => (
              <option key={product.Product_ID} value={product.Product_ID}>
                {product.Product_Name}
              </option>
            ))}
          </select>

          {selectedProductId && <EditProduct productId={selectedProductId} />}
        </>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EmployeeDashboard;