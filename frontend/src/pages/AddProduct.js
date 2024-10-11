import React, { useState } from 'react';
import './UserProfile.css';
import './AddProduct.css';

const AddProduct = () => {
  // State to manage form data, success/error message, and image preview
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    width: '',
    depth: '',
    height: '',
    options: '',
    imageUrl: ''
  });
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Handles changes to input fields and updates the form data state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Updates image preview if the image URL is changed
    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };

  // Submits the form data to the backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format dimensions into a single string
    const dimensions = `${formData.width}mm (width) x ${formData.depth}mm (depth) x ${formData.height}mm (height)`;

    try {
      // Sending a POST request to add the product
      const response = await fetch(`${process.env.REACT_APP_API_URL}/add-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          dimensions,
          imageUrl: formData.imageUrl 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Product added successfully');
        // Reset form after successful submission
        setFormData({ 
          name: '', 
          price: '', 
          quantity: '', 
          description: '', 
          width: '', 
          depth: '', 
          height: '', 
          options: '',
          imageUrl: ''
        });
        setImagePreview('');

        // Refresh the page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } else {
        // Display server error message if request fails
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
        />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        ></textarea>

        <div className="dimensions-group">
          <label htmlFor="width">Width (mm):</label>
          <input
            type="number"
            id="width"
            name="width"
            value={formData.width}
            onChange={handleChange}
          />

          <label htmlFor="depth">Depth (mm):</label>
          <input
            type="number"
            id="depth"
            name="depth"
            value={formData.depth}
            onChange={handleChange}
          />

          <label htmlFor="height">Height (mm):</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
          />
        </div>

        <label htmlFor="options">Product Options:</label>
        <input
          type="text"
          id="options"
          name="options"
          value={formData.options}
          onChange={handleChange}
          placeholder="Enter product options in CSV format i.e. Surfmist, Domain, Monument"
        />

        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Enter the full image URL"
        />
        
        {/* Display image preview if an image URL is entered */}
        {imagePreview && <img src={imagePreview} alt="Product Preview" className="image-preview" />}

        <button type="submit" className="add-product-button">Add Product</button>
      </form>
      {/* Display success or error message */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddProduct;