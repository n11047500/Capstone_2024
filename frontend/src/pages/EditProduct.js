import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import './AddProduct.css';

const EditProduct = ({ productId }) => {
  const [originalFormData, setOriginalFormData] = useState({
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
  
  const [formData, setFormData] = useState(originalFormData);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (productId) {
      fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`)
        .then(response => response.json())
        .then(data => {
          const options = data.Product_Options || '';

          const dimensions = data.Product_Dimensions ? data.Product_Dimensions.split(' x ') : ['', '', ''];
          const width = dimensions[0] ? dimensions[0].split('mm')[0] : '';
          const depth = dimensions[1] ? dimensions[1].split('mm')[0] : '';
          const height = dimensions[2] ? dimensions[2].split('mm')[0] : '';

          const initialData = {
            name: data.Product_Name,
            price: data.Product_Price,
            quantity: data.Quantity_Available,
            description: data.Description,
            width: width,
            depth: depth,
            height: height,
            options: options,
            imageUrl: data.Product_Image_URL,
          };

          setOriginalFormData(initialData);
          setFormData(initialData);
          setImagePreview(data.Product_Image_URL);
        })
        .catch(error => console.error('Error fetching product:', error));
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmation = window.confirm('Are you sure you want to save these changes?');
    if (!confirmation) return;

    const dimensions = `${formData.width}mm (width) x ${formData.depth}mm (depth) x ${formData.height}mm (height)`;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          price: formData.price, // Send as a string if necessary
          quantity: formData.quantity, // Send as a string if necessary
          description: formData.description,
          dimensions, // Ensure this is included
          options: formData.options, // Make sure options is sent
          imageUrl: formData.imageUrl,
        }),
      });

      if (response.ok) {
        setMessage('Product updated successfully');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to update product.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage('An error occurred while updating the product.');
    }
  };

  const handleReset = () => {
    setFormData(originalFormData);
    setImagePreview(originalFormData.imageUrl);
  };

  return (
    <div className="add-product-form">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="product-name">Product Name:</label>
        <input
          type="text"
          id="product-name"
          name="product-name"
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
        />

        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />

        {imagePreview && <img src={imagePreview} alt="Product Preview" className="image-preview" />}

        <button type="submit" className="add-product-button">Update Product</button>
        <button type="button" onClick={handleReset} className="reset-button">Reset</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EditProduct;
