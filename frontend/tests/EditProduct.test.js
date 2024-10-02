import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

  test('renders the EditProduct component', async () => {
    await act(async () => {
      render(<EditProduct productId={productId} />);
    });

    expect(screen.getByText(/Edit Product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Price/i)).toBeInTheDocument();
  });

  test('fetches product data on mount', async () => {
    await act(async () => {
      render(<EditProduct productId={productId} />);
    });
  
    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/${productId}`);
  
    // Use label queries to assert the input values
    await waitFor(() => expect(screen.getByLabelText(/product name/i)).toHaveValue(mockProductData.Product_Name));
    await waitFor(() => expect(screen.getByLabelText(/product price/i)).toHaveValue(mockProductData.Product_Price));
    await waitFor(() => expect(screen.getByLabelText(/quantity available/i)).toHaveValue(mockProductData.Quantity_Available));
    await waitFor(() => expect(screen.getByLabelText(/description/i)).toHaveValue(mockProductData.Description));
  });

  test('handles form input changes', async () => {
    await act(async () => {
      render(<EditProduct productId={productId} />);
    });

    const nameInput = screen.getByLabelText(/Product Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
    expect(nameInput.value).toBe('Updated Product');
  });

  test('submits the form and updates the product', async () => {
    // Mock the initial fetch for product data
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockProductData),
        ok: true,
      })
    );
  
    window.confirm = jest.fn(() => true); // Mock window.confirm to always return true
  
    await act(async () => {
      render(<EditProduct productId={productId} />);
    });
  
    // Wait for the initial data to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i).value).toBe('Test Product');
    });
  
    // Fill out the form with new values
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Updated Product' } });
    fireEvent.change(screen.getByLabelText(/Product Price/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/Quantity Available/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByLabelText(/Width \(mm\):/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/Depth \(mm\):/i), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/Height \(mm\):/i), { target: { value: '350' } });
    fireEvent.change(screen.getByLabelText(/Product Options/i), { target: { value: 'Color: Blue' } });
    fireEvent.change(screen.getByLabelText(/Image URL/i), { target: { value: 'http://example.com/new-image.jpg' } });
  
    // Mock the PUT response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Product updated successfully' }),
        ok: true,
      })
    );
  
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
            price: '150', // Ensure this matches your input type
            quantity: '20', // Ensure this matches your input type
            description: 'Updated Description',
            dimensions: '150mm (width) x 250mm (depth) x 350mm (height)',
            options: 'Color: Blue', // Make sure this is included if needed
            imageUrl: 'http://example.com/new-image.jpg',
          }),
        })
      );
    });
  });  

  test('resets the form data', async () => {
    await act(async () => {
      render(<EditProduct productId={productId} />);
    });

    await waitFor(() => {
      // Ensure that the original data is rendered first
      expect(screen.getByLabelText(/Product Name/i).value).toBe(mockProductData.Product_Name);
    });

    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Updated Product' } });
    fireEvent.click(screen.getByText(/Reset/i));

    expect(screen.getByLabelText(/Product Name/i).value).toBe(mockProductData.Product_Name);
  });
});
