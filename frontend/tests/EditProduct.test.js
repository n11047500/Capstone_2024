import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditProduct from '../src/pages/EditProduct';

global.fetch = jest.fn();

describe('EditProduct Component', () => {
  const productId = '123';
  const mockProductData = {
    Product_Name: 'Test Product',
    Product_Price: 100,
    Quantity_Available: 10,
    Description: 'This is a test product.',
    Product_Dimensions: '100mm x 200mm x 300mm',
    Product_Options: 'Color: Red',
    Product_Image_URL: 'http://example.com/image.jpg',
  };

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation((url) => {
      if (url.includes(productId)) {
        return Promise.resolve({
          json: () => Promise.resolve(mockProductData),
          ok: true,
        });
      }
      return Promise.reject('Product not found');
    });
    process.env.REACT_APP_API_URL = 'http://localhost:4000'; // Mock the environment variable
  });

  test('renders the EditProduct component', () => {
    render(<EditProduct productId={productId} />);

    expect(screen.getByText(/Edit Product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Price/i)).toBeInTheDocument();
  });

  test('fetches product data on mount', async () => {
    render(<EditProduct productId={productId} />);

    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/${productId}`);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProductData.Product_Name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockProductData.Product_Price)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockProductData.Quantity_Available)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockProductData.Description)).toBeInTheDocument();
    });
  });

  test('handles form input changes', () => {
    render(<EditProduct productId={productId} />);

    const nameInput = screen.getByLabelText(/Product Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
    expect(nameInput.value).toBe('Updated Product');
  });

  test('submits the form and updates the product', async () => {
  const productId = '123';
  const mockProductData = {
    Product_Name: 'Test Product',
    Product_Price: 100,
    Quantity_Available: 10,
    Description: 'This is a test product.',
    Product_Dimensions: '100mm x 200mm x 300mm',
    Product_Options: 'Color: Red',
    Product_Image_URL: 'http://example.com/image.jpg'
  };

  fetch.mockResponseOnce(JSON.stringify(mockProductData)); // Mock the initial fetch for product data

  window.confirm = jest.fn(() => true); // Mock window.confirm to always return true

  render(<EditProduct productId={productId} />);

  // Wait for the initial data to be loaded and rendered
  await waitFor(() => {
    expect(screen.getByLabelText(/Product Name/i).value).toBe('Test Product');
    expect(screen.getByLabelText(/Product Price/i).value).toBe('100');
    expect(screen.getByLabelText(/Quantity Available/i).value).toBe('10');
    expect(screen.getByLabelText(/Description/i).value).toBe('This is a test product.');
  });

  // Fill out the form with new values
  fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Updated Product' } });
  fireEvent.change(screen.getByLabelText(/Product Price/i), { target: { value: 150 } });
  fireEvent.change(screen.getByLabelText(/Quantity Available/i), { target: { value: 20 } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated Description' } });
  fireEvent.change(screen.getByLabelText(/Width \(mm\):/i), { target: { value: '150' } });
  fireEvent.change(screen.getByLabelText(/Depth \(mm\):/i), { target: { value: '250' } });
  fireEvent.change(screen.getByLabelText(/Height \(mm\):/i), { target: { value: '350' } });
  fireEvent.change(screen.getByLabelText(/Product Options/i), { target: { value: 'Color: Blue' } });
  fireEvent.change(screen.getByLabelText(/Image URL/i), { target: { value: 'http://example.com/new-image.jpg' } });

  // Mock the PUT response
  fetch.mockResponseOnce(JSON.stringify({ message: 'Product updated successfully' }));

  fireEvent.click(screen.getByText(/Update Product/i));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/products/${productId}`,
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Product',
          price: 150,
          quantity: 20,
          description: 'Updated Description',
          dimensions: '150mm (width) x 250mm (depth) x 350mm (height)',
          imageUrl: 'http://example.com/new-image.jpg',
        }),
      })
    );
  });
});
  
  test('resets the form data', async () => {
    render(<EditProduct productId={productId} />);
  
    await waitFor(() => {
      // Ensure that the original data is rendered first
      expect(screen.getByLabelText(/Product Name/i).value).toBe(mockProductData.Product_Name);
    });
  
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Updated Product' } });
    fireEvent.click(screen.getByText(/Reset/i));
  
    expect(screen.getByLabelText(/Product Name/i).value).toBe(mockProductData.Product_Name);
  });
  
});
