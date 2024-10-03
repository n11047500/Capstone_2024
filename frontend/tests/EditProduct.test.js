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
      return Promise.reject(new Error('Product not found'));
    });
    process.env.REACT_APP_API_URL = 'http://localhost:4000'; // Mock the environment variable

    // Mock window.location.reload
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  test('renders the EditProduct component', async () => {
    render(<EditProduct productId={productId} />);

    expect(screen.getByText(/Edit Product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Price/i)).toBeInTheDocument();
  });

  test('fetches product data on mount', async () => {
    render(<EditProduct productId={productId} />);

    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/${productId}`);

    // Assert the input values using waitFor
    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toHaveValue(mockProductData.Product_Name);
      expect(screen.getByLabelText(/Product Price/i)).toHaveValue(mockProductData.Product_Price);
      expect(screen.getByLabelText(/Quantity Available/i)).toHaveValue(mockProductData.Quantity_Available);
      expect(screen.getByLabelText(/Description/i)).toHaveValue(mockProductData.Description);
    });
  });

  test('handles form input changes', async () => {
    // Render the component
    await act(async () => {
      render(<EditProduct productId={1} />);
    });
  
    // Find the input element
    const nameInput = screen.getByLabelText(/Product Name/i); // Ensure this matches the label for the input
    
    // Simulate a user changing the input value
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
  
    // Assert that the input's value has been updated
    expect(nameInput).toHaveValue('Updated Product');
  });

  
test('submits the form and updates the product', async () => {
  const mockFetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    })
  );

  global.fetch = mockFetch;

  // Render the component
  await act(async () => {
    render(<EditProduct productId={123} />);
  });

  // Simulate input changes
  const nameInput = screen.getByLabelText(/Product Name/i);
  const priceInput = screen.getByLabelText(/Price/i);
  const quantityInput = screen.getByLabelText(/Quantity/i);
  const descriptionInput = screen.getByLabelText(/Description/i);
  const widthInput = screen.getByLabelText(/Width/i);
  const depthInput = screen.getByLabelText(/Depth/i);
  const heightInput = screen.getByLabelText(/Height/i);
  const optionsInput = screen.getByLabelText(/Options/i);
  const imageUrlInput = screen.getByLabelText(/Image URL/i);

  await act(async () => {
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
  fireEvent.change(priceInput, { target: { value: '150' } });
  fireEvent.change(quantityInput, { target: { value: '20' } });
  fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
  fireEvent.change(widthInput, { target: { value: '150' } });
  fireEvent.change(depthInput, { target: { value: '250' } });
  fireEvent.change(heightInput, { target: { value: '350' } });
  fireEvent.change(optionsInput, { target: { value: 'Color: Blue' } });
  fireEvent.change(imageUrlInput, { target: { value: 'http://example.com/new-image.jpg' } });
  });

  // Submit the form
  const submitButton = screen.getByText(/Update Product/i);
  await act(async () => {
    fireEvent.click(submitButton);
  });

  // Assert that fetch was called with the correct arguments
  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:4000/products/123',
    expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Product',
        price: '150',
        quantity: '20',
        description: 'Updated Description',
        dimensions: '150mm (width) x 250mm (depth) x 350mm (height)',
        options: 'Color: Blue',
        imageUrl: 'http://example.com/new-image.jpg',
      }),
    })
  );
});

  test('resets the form data', async () => {
    render(<EditProduct productId={productId} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toHaveValue(mockProductData.Product_Name);
    });

    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Updated Product' } });
    fireEvent.click(screen.getByText(/Reset/i));

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue(mockProductData.Product_Name);
  });

  test('handles error during product update', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to update product.' }),
      })
    );

    window.confirm = jest.fn(() => true); // Mock window.confirm to always return true

    render(<EditProduct productId={productId} />);

    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Updated Product' } });
    fireEvent.click(screen.getByText(/Update Product/i));

    await waitFor(() => {
      expect(screen.getByText(/Failed to update product./i)).toBeInTheDocument();
    });
  });
});
