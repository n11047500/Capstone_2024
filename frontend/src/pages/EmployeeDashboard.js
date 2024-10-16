import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import OrderManagement from './OrderManagement'; // Import the OrderManagement component

const EmployeeDashboard = () => {
  // State variables for managing email input, messages, active form, products, and selected product ID
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeForm, setActiveForm] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Fetch products when the component mounts
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  // Handle role update for granting employee access
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

  // Toggle between different forms based on user selection
  const toggleForm = (formName) => {
    setActiveForm(activeForm === formName ? null : formName);
  };

  // Handle product selection for editing or removing products
  const handleProductSelect = (e) => {
    setSelectedProductId(e.target.value);
  };

  // Handle deletion of a product
  const handleDeleteProduct = async () => {
    const confirmation = window.confirm('Are you sure you want to delete this product?');
    if (confirmation) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${selectedProductId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Update the products list and reset selected product ID
          setProducts(products.filter(product => product.Product_ID !== selectedProductId));
          setSelectedProductId('');
          setMessage('Product deleted successfully.');
        } else {
          setMessage('Failed to delete product.');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setMessage('An error occurred while deleting the product.');
      }
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="dashboard-buttons">
        {/* Buttons to toggle between different dashboard forms */}
        <button onClick={() => toggleForm('addProduct')}>Add Product</button>
        <button onClick={() => toggleForm('editProduct')}>Edit Product</button>
        <button onClick={() => toggleForm('removeProduct')}>Remove Product</button>
        <button onClick={() => toggleForm('grantAccess')}>Grant Access to New User</button>
        <button onClick={() => toggleForm('manageOrders')}>Manage Orders</button>
      </div>

      {/* Conditional rendering of forms based on the active form state */}
      {activeForm === 'manageOrders' && <OrderManagement setActiveForm={setActiveForm} />}
      
      {activeForm === 'grantAccess' && (
        <form onSubmit={handleRoleUpdate} className="add-product-form">
          <label htmlFor="email" style={{ textAlign: 'center', color: '#333', marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>Enter user's email</label>
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
            data-testid="product-select-dropdown" 

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

      {activeForm === 'removeProduct' && (
        <>
          <label htmlFor="productRemoveSelect">Select a Product to Remove:</label>
          <select
            id="productRemoveSelect"
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

          {selectedProductId && (
            <button onClick={handleDeleteProduct} className="delete-product-button">
              Delete Product
            </button>
          )}
        </>
      )}

      {/* Display success or error message */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EmployeeDashboard;