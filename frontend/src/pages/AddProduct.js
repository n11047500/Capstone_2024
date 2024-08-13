import React, { useState } from 'react';
import './UserProfile.css';
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    width: '',
    depth: '',
    height: '',
    options: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Combine width, depth, and height into a single string
    const dimensions = `${formData.width}mm (width) x ${formData.depth}mm (depth) x ${formData.height}mm (height)`;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/add-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          dimensions 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Product added successfully');
        setFormData({ 
          name: '', 
          price: '', 
          quantity: '', 
          description: '', 
          width: '', 
          depth: '', 
          height: '', 
          options: '' 
        });
      } else {
        setMessage(data.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage('An error occurred while adding the product.');
    }
  };

  return (
    <div className="add-product-form">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="price">Product Price:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <label htmlFor="quantity">Quantity Available:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>

        <div className="dimensions-group">
          <label htmlFor="width">Width (mm):</label>
          <input
            type="number"
            id="width"
            name="width"
            value={formData.width}
            onChange={handleChange}
            required
          />

          <label htmlFor="depth">Depth (mm):</label>
          <input
            type="number"
            id="depth"
            name="depth"
            value={formData.depth}
            onChange={handleChange}
            required
          />

          <label htmlFor="height">Height (mm):</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
            required
          />
        </div>

        <label htmlFor="options">Product Options:</label>
        <input
          type="text"
          id="options"
          name="options"
          placeholder="e.g., Surfmist,Domain,Paperbark,Riversand,Jasper,Bushland"
          value={formData.options}
          onChange={handleChange}
        />

        <button type="submit" className="add-product-button">Add Product</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddProduct;